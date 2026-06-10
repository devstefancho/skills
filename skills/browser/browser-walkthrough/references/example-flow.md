# 예시 흐름 — 홈택스 개인사업자등록

```
User: 홈택스 개인사업자등록 같이 진행해줘
Claude: playwright-cli -s=hometax list → snapshot → "로그인 페이지. 로그인해달라" → 대기

User: 로그인했음
Claude: snapshot → "메인 진입. '증명·등록·신청' hover 하면 서브메뉴 열림. 진행?" → 대기

User: 다음
Claude: hover → snapshot → "서브메뉴 열림. '개인 사업자등록 신청' 4가지 중 어떤 거?" → 대기

User: 기본
Claude: click → dialog-accept (보안 alert) → snapshot → "상호 입력 필드. 뭐로?" → 대기

User: 스테판초 랩스
Claude: fill → snapshot → 다음 필드 ...

... (여러 스텝 후)

Claude: "최종 제출 직전. [체크포인트 표]. 'ok 제출' 답하면 접수."

User: ok 제출
Claude: click → "접수 완료 (번호: ...)"

User: 완료
Claude: "[후속 체크리스트: 4/21 건보 확인, 4/22 등록증 출력, ...]"
```
