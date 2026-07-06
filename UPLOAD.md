# GitHub 프로필 README 업로드 가이드

## 준비된 파일

| 파일 | 설명 |
|------|------|
| `README.md` | 프로필 메인 (한/영 병기) |
| `EXHIBITIONS.md` | 전시 실적 전체 목록 (2014–2026) |
| `push-to-github.ps1` | 업로드 자동화 스크립트 |

---

## 1단계: GitHub 계정 준비

1. [GitHub](https://github.com) 계정이 없으면 가입합니다.
2. **사용자명**을 기억해 두세요. (예: `yookhojoon`)
3. `README.md` 3번째 줄의 `GITHUB_USERNAME`을 **본인 GitHub ID**로 바꿉니다.

```html
<!-- 변경 전 -->
<img src="https://github.com/GITHUB_USERNAME.png" ... />

<!-- 변경 후 (예시) -->
<img src="https://github.com/yookhojoon.png" ... />
```

---

## 2단계: GitHub CLI 로그인 (최초 1회)

PowerShell에서 실행:

```powershell
gh auth login
```

- GitHub.com 선택
- HTTPS 선택
- Login with a web browser 선택 후 안내에 따라 인증

---

## 3단계: 업로드 실행

PowerShell에서 이 폴더로 이동 후:

```powershell
cd "C:\Users\GC\Desktop\github-profile"
.\push-to-github.ps1 -Username "본인GitHubID"
```

스크립트가 자동으로:
- `{Username}/{Username}` public 저장소 생성
- 파일 커밋 및 push

---

## 4단계: 프로필 확인

브라우저에서 `https://github.com/본인GitHubID` 접속  
→ 프로필 상단에 README 내용이 표시되면 완료입니다.

---

## 수동 업로드 (CLI 없이)

1. GitHub → **New repository**
2. Repository name: **본인 GitHub ID와 동일** (예: `yookhojoon`)
3. Public, **Add a README** 체크 해제
4. Create repository
5. **uploading an existing file** → `README.md`, `EXHIBITIONS.md` 업로드
6. Commit changes

---

## 참고

- 프로필 README는 반드시 **`사용자명/사용자명`** 저장소의 `README.md`여야 합니다.
- 저장소는 **Public**이어야 합니다.
- 프로필 사진은 GitHub 계정 Settings → Profile picture에서 설정하면 `https://github.com/사용자명.png`로 자동 반영됩니다.
