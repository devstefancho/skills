## Agent Team Ready

| Member | Role | Color |
|--------|------|-------|
| **team-lead** | You - orchestrate and assign work | - |
| **planner** | Brainstorm, spec writing | auto-assigned |
| **implementer** | Code implementation, test writing | auto-assigned |

### How It Works

```
Goal -> planner(spec) -> TaskCreate -> team-lead review -> implementer(code) -> Done
```

1. Tell team-lead what you want to build
2. Team-lead sends the goal to **planner**
3. Planner writes specs in `specs/` and creates implementation tasks
4. Team-lead reviews and assigns tasks to **implementer**
5. Implementer reads specs, writes code + tests, marks tasks done

### Message Routing

자연어로 team-lead에게 요청하면 자동으로 적절한 teammate에게 전달합니다:
- spec/기획/브레인스톰/요구사항 → **planner**
- 코드/테스트/구현/배포 → **implementer**
- 둘 다 필요한 경우 → **planner 먼저** (spec 완료 후 implementer)

### Example Commands

- "인증 기능 스펙 작성해줘" → planner에게 자동 전달
- "login-api 구현해줘" → implementer에게 자동 전달
- "TaskList 보여줘"
- "팀 종료해줘"

### Tips

- Planner has `/loop 10m /writing-specs update spec` running for periodic spec maintenance
- Agents go idle between turns - this is normal, send a message to wake them
- All communication flows through team-lead (planner <-> implementer direct messaging disabled)
- Use `TaskList` to check progress at any time
