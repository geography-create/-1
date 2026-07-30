import RiverIllustration from "../components/RiverIllustration";

interface Props {
  onStart: () => void;
}

export default function IntroScreen({ onStart }: Props) {
  return (
    <section className="screen intro-screen">
      <p className="eyebrow">통합사회1 · Ⅲ. 자연환경과 인간</p>
      <h1>승기천 정비 시뮬레이터</h1>
      <p className="lede">
        같은 하천인데, 사진 속 두 모습은 왜 이렇게 다를까요? 오늘은 여러분이 직접 승기천을 정비하는
        계획을 세우며, 그 이유를 찾아봅니다.
      </p>

      <div className="river-compare">
        <RiverIllustration src={`${import.meta.env.BASE_URL}images/seunggicheon-culvert.webp?v=2`} title="① 복개된 하천 구간" />
        <RiverIllustration src={`${import.meta.env.BASE_URL}images/seunggicheon-eco.webp?v=2`} title="② 생태하천으로 복원된 구간" />
      </div>

      <div className="intro-question">
        <strong>어느 쪽이 더 좋은 하천일까요?</strong>
        <p>선생님의 안내에 따라 손을 들어 의견을 나눠 보세요.</p>
      </div>

      <div className="concept-intro">
        <h2>오늘 비교할 두 관점</h2>
        <p className="muted">
          두 사진처럼 하천을 다루는 방식이 갈리는 건, 자연을 바라보는 관점이 다르기 때문이에요. 아래 두
          관점의 이름과 뜻을 기억해 두면, 잠시 뒤 타일을 배치하고 이유를 고를 때 도움이 될 거예요.
        </p>
        <div className="concept-grid">
          <div className="concept-card human">
            <h3>인간중심주의</h3>
            <p>자연을 인간의 삶에 필요한 도구나 자원으로 바라보며, 인간의 이익과 편의를 우선하는 관점이에요.</p>
          </div>
          <div className="concept-card nature">
            <h3>생태중심주의</h3>
            <p>인간도 자연의 일부이며, 자연은 그 자체로 존중받아야 할 고유한 가치를 지닌다고 보는 관점이에요.</p>
          </div>
        </div>
      </div>

      <div className="core-rules">
        <h2>이번 시간 핵심 규칙 3가지</h2>
        <ol>
          <li>
            <strong>예산 14 안에서 자유롭게.</strong> 타일마다 코스트(1~3)가 달라요. 무엇을 채우고
            무엇을 비울지 예산 안에서 골라보세요.
          </li>
          <li>
            <strong>맞닿으면 달라져요.</strong> 타일끼리, 또는 타일이 하천과 맞닿으면 추가 효과(시너지)가
            생겨요. 화면의 "시너지 안내"에서 확인할 수 있어요.
          </li>
          <li>
            <strong>안을 3개 저장해서 비교.</strong> 서로 다른 안을 만들어 저장하고, 무엇을 얻고 무엇을
            포기했는지 비교해 보세요.
          </li>
        </ol>
        <p className="muted">
          그 외 도전 과제·칭호 같은 기능은 여유가 있을 때 살펴보는 선택 요소예요.
        </p>
      </div>

      <div className="notice-box">
        <h2>시작하기 전에</h2>
        <ul>
          <li>이 시뮬레이터의 지표 수치는 교육용으로 만든 가상 모델이에요. 실제 승기천 정비사업의 예측값이 아니에요.</li>
          <li>로그인 없이 진행돼요. 배치를 탐색하고 비교하는 동안은 이름을 입력하지 않아요.</li>
          <li>맨 마지막 정리 단계에서만 반·번호·이름과 한 줄 성찰을 입력하고, 선생님이 결과를 확인해요. 새로고침하면 그 전까지의 기록은 사라져요.</li>
          <li>정답은 없어요. 어떤 자연관을 선택하든, 왜 그렇게 생각했는지가 중요해요.</li>
        </ul>
      </div>

      <button type="button" className="primary-btn" onClick={onStart}>
        내 기기로 시작하기
      </button>
    </section>
  );
}
