"use strict";

const 게임판 = document.querySelector("#게임판");
const 붓 = 게임판.getContext("2d");

// 기획서에서 정한 게임 크기와 개수입니다.
const 설정 = {
  너비: 960,
  높이: 700,
  벽돌열: 9,
  벽돌행: 7,
  벽돌너비: 100,
  벽돌높이: 36,
  벽돌가로간격: 4,
  벽돌세로간격: 5,
  벽돌시작Y: 70,
  조작바너비: 150,
  조작바높이: 16,
  조작바Y: 660,
  조작바속도: 4,
  공반지름: 8,
  공속도: 2,
  토끼크기비율: 1.3,
  시작목숨: 3,
  벽돌점수: 10,
};

const 무지개색 = [
  "#f8a5a5", // 파스텔 빨강
  "#fbc38d", // 파스텔 주황
  "#f8e58c", // 파스텔 노랑
  "#a8e6b1", // 파스텔 초록
  "#9ccbfa", // 파스텔 파랑
  "#a9a7e8", // 파스텔 남색
  "#d7a8e8", // 파스텔 보라
];

const 하트윤곽선색 = [
  "#b42318", // 진한 빨강
  "#9a3412", // 진한 주황
  "#854d0e", // 진한 노랑
  "#166534", // 진한 초록
  "#1d4ed8", // 진한 파랑
  "#3730a3", // 진한 남색
  "#7e22ce", // 진한 보라
];

let 게임상태 = "시작전";
let 점수 = 0;
let 목숨 = 설정.시작목숨;
let 남은벽돌수 = 설정.벽돌열 * 설정.벽돌행;
let 벽돌목록 = [];
let 왼쪽키누름 = false;
let 오른쪽키누름 = false;

const 조작바 = {
  x: (설정.너비 - 설정.조작바너비) / 2,
  y: 설정.조작바Y,
  너비: 설정.조작바너비,
  높이: 설정.조작바높이,
};

const 공 = {
  x: 설정.너비 / 2,
  y: 설정.조작바Y - 설정.공반지름,
  반지름: 설정.공반지름,
  속도X: 설정.공속도,
  속도Y: -설정.공속도,
};

function 벽돌만들기() {
  벽돌목록 = [];
  const 전체벽돌너비 =
    설정.벽돌열 * 설정.벽돌너비 +
    (설정.벽돌열 - 1) * 설정.벽돌가로간격;
  const 시작X = (설정.너비 - 전체벽돌너비) / 2;

  for (let 행 = 0; 행 < 설정.벽돌행; 행 += 1) {
    for (let 열 = 0; 열 < 설정.벽돌열; 열 += 1) {
      const 색상번호 = (행 + 열) % 무지개색.length;
      벽돌목록.push({
        x: 시작X + 열 * (설정.벽돌너비 + 설정.벽돌가로간격),
        y: 설정.벽돌시작Y + 행 * (설정.벽돌높이 + 설정.벽돌세로간격),
        너비: 설정.벽돌너비,
        높이: 설정.벽돌높이,
        색상: 무지개색[색상번호],
        하트색상: 하트윤곽선색[(행 * 설정.벽돌열 + 열) % 하트윤곽선색.length],
        보임: true,
      });
    }
  }
}

function 공과조작바제자리() {
  조작바.x = (설정.너비 - 조작바.너비) / 2;
  공.x = 조작바.x + 조작바.너비 / 2;
  공.y = 조작바.y - 공.반지름 * 설정.토끼크기비율 - 1;
  공.속도X = 설정.공속도;
  공.속도Y = -설정.공속도;
}

function 게임초기화() {
  점수 = 0;
  목숨 = 설정.시작목숨;
  남은벽돌수 = 설정.벽돌열 * 설정.벽돌행;
  게임상태 = "시작전";
  왼쪽키누름 = false;
  오른쪽키누름 = false;
  벽돌만들기();
  공과조작바제자리();
}

function 둥근사각형그리기(x, y, 너비, 높이, 반지름) {
  붓.beginPath();
  붓.roundRect(x, y, 너비, 높이, 반지름);
  붓.fill();
}

function 화면그리기() {
  붓.clearRect(0, 0, 설정.너비, 설정.높이);
  붓.fillStyle = "#ffffff";
  붓.fillRect(0, 0, 설정.너비, 설정.높이);

  정보그리기();
  벽돌그리기();
  조작바그리기();
  공그리기();
  안내문구그리기();
}

function 정보그리기() {
  붓.fillStyle = "#111827";
  붓.font = "700 25px 'Malgun Gothic', sans-serif";
  붓.textAlign = "left";
  붓.textBaseline = "middle";
  붓.fillText("무지개 하트 벽돌깨기", 18, 32);

  붓.font = "700 18px 'Malgun Gothic', sans-serif";
  붓.textAlign = "right";
  붓.fillText(`점수: ${점수}`, 820, 32);
  붓.fillText(`목숨: ${"♥".repeat(목숨)}`, 942, 32);

  붓.strokeStyle = "#d1d5db";
  붓.lineWidth = 1;
  붓.beginPath();
  붓.moveTo(18, 55);
  붓.lineTo(942, 55);
  붓.stroke();
}

function 둥근하트그리기(가운데X, 가운데Y) {
  붓.beginPath();
  붓.moveTo(가운데X, 가운데Y + 12);

  // 왼쪽의 둥근 부분부터 위쪽 가운데 홈까지 그립니다.
  붓.bezierCurveTo(
    가운데X - 3,
    가운데Y + 8,
    가운데X - 14,
    가운데Y + 3,
    가운데X - 14,
    가운데Y - 4,
  );
  붓.bezierCurveTo(
    가운데X - 14,
    가운데Y - 11,
    가운데X - 4,
    가운데Y - 13,
    가운데X,
    가운데Y - 6,
  );

  // 오른쪽도 같은 곡선으로 그려 통통하고 둥근 모양을 만듭니다.
  붓.bezierCurveTo(
    가운데X + 4,
    가운데Y - 13,
    가운데X + 14,
    가운데Y - 11,
    가운데X + 14,
    가운데Y - 4,
  );
  붓.bezierCurveTo(
    가운데X + 14,
    가운데Y + 3,
    가운데X + 3,
    가운데Y + 8,
    가운데X,
    가운데Y + 12,
  );
  붓.closePath();
  붓.lineWidth = 3;
  붓.lineJoin = "round";
  붓.stroke();
}

function 벽돌그리기() {
  벽돌목록.forEach((벽돌) => {
    if (!벽돌.보임) return;

    붓.fillStyle = 벽돌.색상;
    둥근사각형그리기(벽돌.x, 벽돌.y, 벽돌.너비, 벽돌.높이, 6);

    붓.strokeStyle = 벽돌.하트색상;
    둥근하트그리기(벽돌.x + 벽돌.너비 / 2, 벽돌.y + 벽돌.높이 / 2);
  });
}

function 조작바그리기() {
  붓.fillStyle = "#7dd3fc";
  둥근사각형그리기(조작바.x, 조작바.y, 조작바.너비, 조작바.높이, 8);
}

function 공그리기() {
  붓.save();
  붓.translate(공.x, 공.y);
  붓.scale(설정.토끼크기비율, 설정.토끼크기비율);

  // 얼굴 뒤쪽에 길고 둥근 토끼 귀를 그립니다.
  붓.fillStyle = "#fffafc";
  붓.strokeStyle = "#9f7aea";
  붓.lineWidth = 1.5;

  붓.beginPath();
  붓.ellipse(-4.5, -9, 3.5, 7, -0.18, 0, Math.PI * 2);
  붓.fill();
  붓.stroke();

  붓.beginPath();
  붓.ellipse(4.5, -9, 3.5, 7, 0.18, 0, Math.PI * 2);
  붓.fill();
  붓.stroke();

  // 귀 안쪽은 연한 분홍색으로 작게 채웁니다.
  붓.fillStyle = "#f9a8d4";
  붓.beginPath();
  붓.ellipse(-4.5, -9, 1.4, 4.5, -0.18, 0, Math.PI * 2);
  붓.ellipse(4.5, -9, 1.4, 4.5, 0.18, 0, Math.PI * 2);
  붓.fill();

  // 기존 공의 충돌 크기와 같은 둥근 얼굴입니다.
  붓.fillStyle = "#fffafc";
  붓.strokeStyle = "#9f7aea";
  붓.lineWidth = 1.5;
  붓.beginPath();
  붓.arc(0, 1, 공.반지름, 0, Math.PI * 2);
  붓.fill();
  붓.stroke();

  // 작은 눈과 코를 그립니다.
  붓.fillStyle = "#312e3f";
  붓.beginPath();
  붓.arc(-3, 0, 1, 0, Math.PI * 2);
  붓.arc(3, 0, 1, 0, Math.PI * 2);
  붓.fill();

  붓.fillStyle = "#f472b6";
  붓.beginPath();
  붓.arc(0, 3, 1.2, 0, Math.PI * 2);
  붓.fill();

  // 양쪽 볼과 웃는 입으로 귀여운 표정을 만듭니다.
  붓.fillStyle = "rgba(251, 113, 133, 0.45)";
  붓.beginPath();
  붓.arc(-5, 3, 1.7, 0, Math.PI * 2);
  붓.arc(5, 3, 1.7, 0, Math.PI * 2);
  붓.fill();

  붓.strokeStyle = "#312e3f";
  붓.lineWidth = 1;
  붓.lineCap = "round";
  붓.beginPath();
  붓.moveTo(0, 4);
  붓.quadraticCurveTo(-1.5, 6, -3, 4.8);
  붓.moveTo(0, 4);
  붓.quadraticCurveTo(1.5, 6, 3, 4.8);
  붓.stroke();

  붓.restore();
}

function 안내상자(첫줄, 둘째줄) {
  붓.fillStyle = "rgba(255, 255, 255, 0.94)";
  둥근사각형그리기(220, 445, 520, 112, 16);
  붓.strokeStyle = "#111827";
  붓.lineWidth = 2;
  붓.strokeRect(220, 445, 520, 112);

  붓.fillStyle = "#111827";
  붓.font = "700 28px 'Malgun Gothic', sans-serif";
  붓.textAlign = "center";
  붓.textBaseline = "middle";
  붓.fillText(첫줄, 설정.너비 / 2, 481);
  붓.font = "18px 'Malgun Gothic', sans-serif";
  붓.fillText(둘째줄, 설정.너비 / 2, 525);
}

function 안내문구그리기() {
  if (게임상태 === "시작전") {
    안내상자("스페이스키를 눌러 시작하세요", "← → 또는 A / D 키로 조작합니다");
  } else if (게임상태 === "재대기") {
    안내상자("아직 기회가 남았어요!", "스페이스키를 누르면 다시 출발합니다");
  } else if (게임상태 === "성공") {
    안내상자("게임 성공!", `최종 점수 ${점수}점 · 스페이스키로 다시 시작`);
  } else if (게임상태 === "실패") {
    안내상자("게임 오버", `최종 점수 ${점수}점 · 스페이스키로 다시 시작`);
  }
}

function 조작바움직이기() {
  if (왼쪽키누름 === 오른쪽키누름) return;

  if (왼쪽키누름) 조작바.x -= 설정.조작바속도;
  if (오른쪽키누름) 조작바.x += 설정.조작바속도;

  조작바.x = Math.max(0, Math.min(설정.너비 - 조작바.너비, 조작바.x));

  if (게임상태 !== "진행중") {
    공.x = 조작바.x + 조작바.너비 / 2;
  }
}

function 공움직이기() {
  if (게임상태 !== "진행중") return;

  const 이전X = 공.x;
  const 이전Y = 공.y;
  공.x += 공.속도X;
  공.y += 공.속도Y;

  if (공.x - 공.반지름 <= 0) {
    공.x = 공.반지름;
    공.속도X = Math.abs(공.속도X);
  } else if (공.x + 공.반지름 >= 설정.너비) {
    공.x = 설정.너비 - 공.반지름;
    공.속도X = -Math.abs(공.속도X);
  }

  if (공.y - 공.반지름 <= 0) {
    공.y = 공.반지름;
    공.속도Y = Math.abs(공.속도Y);
  }

  조작바충돌확인(이전Y);
  벽돌충돌확인(이전X, 이전Y);

  if (공.y - 공.반지름 > 설정.높이) {
    목숨 -= 1;
    if (목숨 === 0) {
      게임상태 = "실패";
    } else {
      게임상태 = "재대기";
      공과조작바제자리();
    }
  }
}

function 조작바충돌확인(이전Y) {
  const 위에서내려옴 = 공.속도Y > 0 && 이전Y + 공.반지름 <= 조작바.y;
  const 가로로겹침 =
    공.x + 공.반지름 >= 조작바.x &&
    공.x - 공.반지름 <= 조작바.x + 조작바.너비;
  const 세로로닿음 =
    공.y + 공.반지름 >= 조작바.y &&
    공.y - 공.반지름 <= 조작바.y + 조작바.높이;

  if (!위에서내려옴 || !가로로겹침 || !세로로닿음) return;

  공.y = 조작바.y - 공.반지름;
  const 맞은위치 = (공.x - (조작바.x + 조작바.너비 / 2)) / (조작바.너비 / 2);
  const 최대가로속도 = 설정.공속도 * 1.35;
  공.속도X = 맞은위치 * 최대가로속도;

  // 거의 수직으로만 움직이면 게임이 단조로워져 최소 가로 속도를 줍니다.
  if (Math.abs(공.속도X) < 1.2) {
    공.속도X = 공.속도X < 0 ? -1.2 : 1.2;
  }
  공.속도Y = -Math.sqrt(Math.max(9, 설정.공속도 ** 2 * 2 - 공.속도X ** 2));
}

function 벽돌충돌확인(이전X, 이전Y) {
  for (const 벽돌 of 벽돌목록) {
    if (!벽돌.보임) continue;

    const 충돌함 =
      공.x + 공.반지름 >= 벽돌.x &&
      공.x - 공.반지름 <= 벽돌.x + 벽돌.너비 &&
      공.y + 공.반지름 >= 벽돌.y &&
      공.y - 공.반지름 <= 벽돌.y + 벽돌.높이;

    if (!충돌함) continue;

    벽돌.보임 = false;
    남은벽돌수 -= 1;
    점수 += 설정.벽돌점수;

    const 이전에가로밖 =
      이전X + 공.반지름 <= 벽돌.x ||
      이전X - 공.반지름 >= 벽돌.x + 벽돌.너비;
    if (이전에가로밖) {
      공.속도X *= -1;
    } else {
      공.속도Y *= -1;
    }

    if (남은벽돌수 === 0) 게임상태 = "성공";

    // 한 화면 갱신에서는 벽돌 하나만 제거합니다.
    break;
  }
}

function 반복실행() {
  조작바움직이기();
  공움직이기();
  화면그리기();
  requestAnimationFrame(반복실행);
}

function 게임시작또는재시작() {
  if (게임상태 === "시작전" || 게임상태 === "재대기") {
    게임상태 = "진행중";
  } else if (게임상태 === "성공" || 게임상태 === "실패") {
    게임초기화();
  }
}

function 누른키변경(키, 눌림) {
  if (키 === "ArrowLeft" || 키.toLowerCase() === "a") 왼쪽키누름 = 눌림;
  if (키 === "ArrowRight" || 키.toLowerCase() === "d") 오른쪽키누름 = 눌림;
}

document.addEventListener("keydown", (이벤트) => {
  const 게임키 = ["ArrowLeft", "ArrowRight", " ", "Spacebar", "a", "A", "d", "D"];
  if (게임키.includes(이벤트.key)) 이벤트.preventDefault();

  if (이벤트.key === " " || 이벤트.key === "Spacebar") {
    if (!이벤트.repeat) 게임시작또는재시작();
    return;
  }

  누른키변경(이벤트.key, true);
});

document.addEventListener("keyup", (이벤트) => {
  누른키변경(이벤트.key, false);
});

window.addEventListener("blur", () => {
  왼쪽키누름 = false;
  오른쪽키누름 = false;
});

게임초기화();
화면그리기();
게임판.focus();
requestAnimationFrame(반복실행);
