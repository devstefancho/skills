# Known Issues — Computer Use MCP

과거 테스트 세션에서 확인된 문제와 대응 방법.

## request_access 타임아웃

리모트 환경에서는 데스크톱 권한 승인 팝업을 확인할 수 없어 타임아웃이 발생한다. **재시도로 해결** (최대 3회).

## 세션 만료

장시간 대기 후 세션 리셋이 발생한다. `request_access`를 재요청해야 한다.

## 멀티모니터

앱이 다른 모니터에 있으면 보이지 않는다. `switch_display`로 앱이 있는 모니터로 전환한다.

## 메뉴바 auto-hide

macOS 메뉴바가 auto-hide 상태면 마우스를 `y=0`으로 이동 후 **1초 대기**해야 메뉴바가 표시된다.

## 앱 실행

`open -a` 명령 실행 시 `dangerouslyDisableSandbox: true`가 필요할 수 있다.
