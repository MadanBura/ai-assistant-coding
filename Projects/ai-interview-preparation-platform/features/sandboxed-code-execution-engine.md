# Feature Specification: Sandboxed Code Execution Engine
## Feature Path: `features/sandboxed-code-execution-engine.md`

### 1. Feature Overview
The Sandboxed Code Execution Engine is a secure backend microservice responsible for compiling and running untrusted code submitted by users. It supports Python, JavaScript, Java, and C++, isolating each execution in an ephemeral container with strict resource constraints (memory, CPU, execution time) to prevent malicious behaviors, host system escapes, or denial-of-service (DoS) attacks.

---

### 2. User Stories
* **US-4.1 (Safe Compilation)**: As a backend developer, I want all user-submitted code to execute inside isolated virtual environments so that the host system is protected from malicious scripts (e.g., file system access, network sniffing).
* **US-4.2 (Feedback Loop)**: As a candidate, I want to execute my code and receive stdout, stderr, execution times, and memory usages in a few seconds so that I can debug code in real-time.

---

### 3. Functional Requirements

#### 3.1 Multi-Language Support
* **FR-4.1.1**: Support compiling and running the following language runtimes:
  * **Python**: Python 3.10+ runtime.
  * **JavaScript**: Node.js 18+ runtime.
  * **Java**: OpenJDK 17 runtime.
  * **C++**: GCC/G++ 11+ compilation.

#### 3.2 Containerized Execution
* **FR-4.2.1**: Each execution task must run in an ephemeral, stateless Docker container (or a secure lightweight sandbox alternative like gVisor or AWS Firecracker).
* **FR-4.2.2**: The sandbox environment must have **all network access disabled** (`--network none`).
* **FR-4.2.3**: Read-only root file system configuration to prevent code execution from writing persistent files to the container disk.

#### 3.3 Resource Limits
* **FR-4.3.1**: **CPU Limit**: Max 1 CPU core allocation per container.
* **FR-4.3.2**: **Memory Limit**: Hard limit of $256 \text{ MB}$. If the process exceeds this, terminate it immediately with an Out-Of-Memory (OOM) error code.
* **FR-4.3.3**: **Time Limit**: Max execution time of $2.0 \text{ seconds}$. If the code hangs (e.g., infinite loop), kill the process.

#### 3.4 Result Processing
* **FR-4.4.1**: Parse the output of execution task into a JSON format containing:
  * `stdout`: Standard output logs.
  * `stderr`: Compilation/Runtime error logs.
  * `exitCode`: Integer process termination code.
  * `executionTime`: Time taken in milliseconds.
  * `memoryUsed`: Memory utilized in kilobytes.

---

### 4. Technical Design Notes

#### Execution Architecture
```
[Frontend Client]
      |  (API Request with code + language)
      v
[Backend REST Service]
      |  (Task Enqueued)
      v
[Sandbox Runner Agent] 
      |  (Spawns isolated container)
      +---> [ gVisor/Docker Sandbox ] 
                 |  - Mounts temp code file
                 |  - Executes script/binary
                 |  - Captures stdout/stderr/limits
                 v
[Backend REST Service] ---> [Frontend Console Output]
```

---

### 5. Acceptance Criteria

| ID | Scenario | Given | When | Then |
| :--- | :--- | :--- | :--- | :--- |
| **AC-4.1** | Infinite Loop Handling | A Python script containing `while True:` | Executed by sandbox | Terminate execution after exactly $2.0\text{ seconds}$ and return exit code/timeout error message. |
| **AC-4.2** | Memory Exceeded | A Node.js script allocating large memory buffers | Executed by sandbox | Terminate process when memory hits $256\text{ MB}$, and return "OutOfMemoryException". |
| **AC-4.3** | Security Sandbox Check | A script attempting to read host configuration `/etc/shadow` or run `ping` | Executed by sandbox | Operation is denied (Permission denied/Host unreachable) and logged. |
