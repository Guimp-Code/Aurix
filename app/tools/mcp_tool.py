import os, sys, json, time, uuid, threading, queue, subprocess, atexit, shlex, pathlib, logging
from typing import Dict, Any, Optional, List
import yaml

LOG_DIR = pathlib.Path.home() / "aurix" / "data" / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)
LOG_FILE = LOG_DIR / "mcp.log"

logging.basicConfig(
    filename=str(LOG_FILE), level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)

def _expand(v: str) -> str:
    # expande ~, $HOME, $USER
    return os.path.expanduser(os.path.expandvars(v))

def _now_ms() -> int:
    return int(time.time() * 1000)

class MCPServerProcess:
    def __init__(self, name: str, cmd: List[str], cwd: Optional[str] = None):
        self.name = name
        self.cmd = cmd
        self.cwd = _expand(cwd) if cwd else None
        self.proc: Optional[subprocess.Popen] = None
        self.out_q: "queue.Queue[str]" = queue.Queue(maxsize=10000)
        self.err_q: "queue.Queue[str]" = queue.Queue(maxsize=10000)
        self._lock = threading.Lock()
        self._reader_threads: List[threading.Thread] = []

    def start(self):
        with self._lock:
            if self.proc and self.proc.poll() is None:
                return
            # Fallback: se "uvx" não existe, troca por "mcp-server-git"
            if self.cmd and self.cmd[0] == "uvx" and not shutil.which("uvx"):
                self.cmd = ["mcp-server-git"] + self.cmd[2:]
            logging.info(f"[{self.name}] start: {self.cmd} cwd={self.cwd}")
            self.proc = subprocess.Popen(
                self.cmd,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                cwd=self.cwd,
                text=True,
                bufsize=1
            )
            self._start_readers()
            atexit.register(self.stop)

    def _start_readers(self):
        def _pump(stream, q: "queue.Queue[str]", tag: str):
            while True:
                if stream is None:
                    break
                line = stream.readline()
                if not line:
                    break
                try:
                    q.put_nowait(line)
                except queue.Full:
                    # drop overflow
                    pass
                if tag == "stderr":
                    logging.debug(f"[{self.name}] STDERR: {line.strip()}")

        t1 = threading.Thread(target=_pump, args=(self.proc.stdout, self.out_q, "stdout"), daemon=True)
        t2 = threading.Thread(target=_pump, args=(self.proc.stderr, self.err_q, "stderr"), daemon=True)
        t1.start(); t2.start()
        self._reader_threads = [t1, t2]

    def stop(self):
        with self._lock:
            if self.proc and self.proc.poll() is None:
                logging.info(f"[{self.name}] stop")
                try:
                    self.proc.terminate()
                    try:
                        self.proc.wait(timeout=2)
                    except subprocess.TimeoutExpired:
                        self.proc.kill()
                except Exception:
                    pass
            self.proc = None

    def send_line(self, line: str):
        if not self.proc or self.proc.poll() is not None:
            raise RuntimeError(f"{self.name}: processo não iniciado")
        assert self.proc.stdin is not None
        self.proc.stdin.write(line + "\n")
        self.proc.stdin.flush()

    def read_line(self, timeout_s: float) -> Optional[str]:
        try:
            return self.out_q.get(timeout=timeout_s)
        except queue.Empty:
            return None

import shutil

class MCPClient:
    def __init__(self, servers_yaml_path: pathlib.Path):
        self.path = servers_yaml_path
        self.path = pathlib.Path(_expand(str(self.path)))
        self.servers_cfg = self._load_yaml()
        self._proc_map: Dict[str, MCPServerProcess] = {}
        self._proc_lock = threading.Lock()
        self._tool_cache: Dict[str, List[Dict[str, Any]]] = {}  # name -> tools

    def _load_yaml(self) -> Dict[str, Any]:
        if not self.path.exists():
            raise FileNotFoundError(f"servers.yaml não encontrado: {self.path}")
        data = yaml.safe_load(self.path.read_text(encoding="utf-8")) or {}
        servers = data.get("servers", {})
        # expandir env nos args
        for name, cfg in servers.items():
            cmd = cfg.get("command", [])
            servers[name]["command"] = [ _expand(str(x)) for x in cmd ]
            logging.info(f"[YAML] {name}: {servers[name]['command']}")
        return servers

    def ensure_started(self, name: str) -> MCPServerProcess:
        with self._proc_lock:
            if name in self._proc_map and self._proc_map[name].proc and self._proc_map[name].proc.poll() is None:
                return self._proc_map[name]
            cfg = self.servers_cfg.get(name)
            if not cfg:
                raise KeyError(f"server '{name}' não definido em {self.path}")
            proc = MCPServerProcess(name, cfg["command"])
            proc.start()
            self._proc_map[name] = proc
            self._initialize(name)  # handshake
            return proc

    def _jsonrpc(self, method: str, params: Dict[str, Any]) -> Dict[str, Any]:
        return {"jsonrpc":"2.0","id":str(uuid.uuid4()),"method":method,"params":params}

    def _send_and_wait(self, proc: MCPServerProcess, req: Dict[str, Any], timeout_s: int) -> Dict[str, Any]:
        deadline = time.time() + timeout_s
        proc.send_line(json.dumps(req))
        wanted = req["id"]
        buf = []
        while time.time() < deadline:
            line = proc.read_line(timeout_s=min(0.2, max(0.01, deadline - time.time())))
            if not line:
                continue
            buf.append(line)
            line = line.strip()
            if not line.startswith("{"):
                continue
            try:
                obj = json.loads(line)
            except Exception:
                continue
            if obj.get("id") == wanted or ("result" in obj or "error" in obj):
                return obj
        raise TimeoutError(f"{proc.name}: timeout aguardando resposta de {req.get('method')}")

    def _initialize(self, name: str):
        proc = self._proc_map[name]
        logging.info(f"[{name}] initialize")
        init = self._jsonrpc("initialize", {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {
                "name": "aurix-mcp-client",
                "version": "1.0.0"
            }
        })
        try:
            self._send_and_wait(proc, init, timeout_s=10)
        except Exception as e:
            logging.warning(f"[{name}] initialize falhou: {e}")
        # listar ferramentas
        try:
            tools = self._list_tools(name)
            self._tool_cache[name] = tools
        except Exception as e:
            logging.error(f"[{name}] tools/list falhou: {e}")

    def _list_tools(self, name: str) -> List[Dict[str, Any]]:
        proc = self._proc_map[name]
        req = self._jsonrpc("tools/list", {})
        resp = self._send_and_wait(proc, req, timeout_s=10)
        if "result" in resp and isinstance(resp["result"], dict):
            tools = resp["result"].get("tools") or resp["result"].get("data") or []
            if isinstance(tools, list):
                return tools
        # fallback: alguns servers retornam lista direta
        if isinstance(resp.get("result"), list):
            return resp["result"]
        raise RuntimeError(f"{name}: resposta inesperada de tools/list -> {resp}")

    def call(self, server: str, tool: str, params: Dict[str, Any], timeout_s: int = 30) -> Dict[str, Any]:
        proc = self.ensure_started(server)
        # revalida cache de tools
        tools = self._tool_cache.get(server) or []
        if not tools:
            try:
                tools = self._list_tools(server)
                self._tool_cache[server] = tools
            except Exception as e:
                logging.warning(f"[{server}] list tools erro: {e}")
        tool_names = { t.get("name") for t in tools if isinstance(t, dict) }
        if tool not in tool_names:
            logging.info(f"[{server}] tool '{tool}' não no cache; tentando assim mesmo")

        # tentativa 1: tools/call
        req = self._jsonrpc("tools/call", {"name": tool, "arguments": params})
        start = _now_ms()
        try:
            resp = self._send_and_wait(proc, req, timeout_s)
            elapsed = _now_ms() - start
            logging.info(f"[{server}] call {tool} ({elapsed}ms)")
            if "result" in resp:
                return {"ok": True, "data": resp["result"]}
            return {"ok": False, "error": resp.get("error") or resp}
        except TimeoutError as te:
            logging.error(f"[{server}] timeout tools/call: {te}")
            return {"ok": False, "error": str(te)}
        except Exception as e:
            logging.warning(f"[{server}] tools/call falhou, tentando call_tool: {e}")

        # fallback: call_tool
        req2 = self._jsonrpc("call_tool", {"name": tool, "arguments": params})
        try:
            resp2 = self._send_and_wait(proc, req2, timeout_s)
            if "result" in resp2:
                return {"ok": True, "data": resp2["result"]}
            return {"ok": False, "error": resp2.get("error") or resp2}
        except Exception as e2:
            return {"ok": False, "error": f"falha em tools/call e call_tool: {e2}"}
