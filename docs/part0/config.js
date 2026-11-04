/* 0편(기초편) 교재 설정 — assets/book.js가 읽는다. 장 HTML보다 먼저 불러온다.
   - book: 이 편의 목차. 모든 페이지가 공유하는 단일 진실 원천. 커리큘럼의 screens/hours를 옮겨 적는다.
     ready:true인 장만 링크가 되고 "이어서 읽기" 대상이 된다. 집필 전 장은 ready를 빼 두면 목차에 회색으로 남는다.
   - terms: 본문의 <span class="term" data-term="키">낱말</span> 이 이 표에서 뜻을 찾는다.
     표에 없는 키를 쓰면 툴팁이 조용히 안 나온다. _smoke 항목은 authoring/_smoke.html이 참조하므로 지우지 않는다.
   - storePrefix: 진도 저장 키 접두어. file:// 에서는 로컬 페이지가 저장소를 공유하므로 편마다 다르게 둔다. */
window.BOOK_CONFIG = {
  title: 'CT 재구성 알고리즘0 - 기초편',
  subtitle: 'CT란 무엇이고, 재구성은 어떤 문제인가',
  storePrefix: 'ctrecon0',
  shortName: '0편',   // 다른 편에서 돌아가기 버튼에 붙이는 이름
  homeHref: '../index.html',   // 사이드바의 "← 홈으로" 링크. 기본값은 두 단계 위(../../index.html)
  book: [
    { id: 'ch01', num: '1장', title: 'CT가 뭐예요?', part: 'I. 공통 기초', screens: 8, hours: 1.5, ready: true },
    { id: 'ch02', num: '2장', title: '검출기가 읽은 숫자, 식으로 적어 보기: 투영과 선적분', part: 'I. 공통 기초', screens: 9, hours: 1.7, ready: true },
    { id: 'ch03', num: '3장', title: '재구성 방법의 큰 지도', part: 'I. 공통 기초', screens: 3, hours: 0.6, ready: true }
  ],
  terms: {
    _smoke: '스모크 점검용 항목 — 이 줄은 지우지 않는다.',
    pixel: '화소(Pixel). 영상을 이루는 가장 작은 네모 칸. CT 영상에서는 칸마다 숫자 하나(감쇠계수 또는 CT 넘버)가 들어 있다.',
    mu: '감쇠계수(Attenuation Coefficient, μ). 선형 감쇠계수(Linear Attenuation Coefficient)라고도 한다. 물질 속에서 단위 길이당 광자가 줄어드는 비율이며 단위는 cm⁻¹. 밀도와 대체로 비례하지만 같지 않고 X선 에너지에 따라 달라진다.',
    photon: '광자(Photon). X선을 이루는 입자. 물질 속에서 흡수되거나 방향이 꺾이면 곧게 통과하지 못한다.',
    attenuation: '감쇠(Attenuation). 물질을 지나며 곧게 통과하는 광자가 줄어 X선 세기가 약해지는 일. 광자 수가 줄어드는 것이며 밀도 자체와는 다른 개념이다.',
    beer: '비어–람베르트 법칙(Beer–Lambert Law). 균일한 물질을 지난 X선 세기가 I = I₀e^(−μL) 로 줄어든다는 지수 감쇠 법칙. 단색광과 직진하는 광자를 전제한다.',
    hvl: '반가층(Half-Value Layer). X선 세기가 절반이 되는 두께 ln2/μ. 물에서는 약 3.65 cm.',
    hu: 'CT 넘버(Hounsfield Unit, HU). 감쇠계수를 물 0, 공기 −1000으로 맞춘 상대 눈금. μ 자체가 아니다.',
    mono: '단색광(Monochromatic). 모든 광자의 에너지가 같은 X선. 실제 X선관은 넓은 에너지 분포를 내므로 이상화된 가정이다.',
    poly: '다색광(Polychromatic). 여러 에너지가 섞인 X선. 에너지마다 μ 가 달라서 단색광의 지수 감쇠식이 그대로 성립하지 않는다(1장 p6 접기).',
    scatter: '산란(Scatter). 물질 속에서 광자의 방향이 꺾이는 일. 이 책의 모델은 산란이 없다고 가정한다.',
    detpixel: '검출기 칸(Detector Pixel). 검출기를 이루는 작은 칸. 선원에서 그 칸까지 이어지는 광선 한 줄기의 세기를 읽는다. 영상의 화소와 다르다.',
    ray: '광선(Ray). 선원에서 검출기 칸 하나까지 이어지는 가느다란 직선 경로. 이 책에서 측정값 하나는 광선 하나에 대응한다.',
    airscan: '공기 스캔(Air Scan). 물체 없이 같은 조건으로 촬영해 각 검출기 칸의 기준 신호를 얻는 측정.',
    dark: '암전류(Dark Current). X선이 없어도 검출기 칸이 내는 신호. 읽은 값에 더해지므로 비를 취하기 전에 빼야 한다.',
    flatfield: '플랫필드 보정(Flat-field Correction). 물체가 없을 때 모든 검출기 칸이 같은 I₀를 읽도록 맞추는 전처리. 재구성 알고리즘의 일부가 아니라 그 앞 단계이다.',
    projval: '투영값(Projection Value). 광선 하나에서 p = −ln(I/I₀) = ∫μ dℓ. 단위가 없는 숫자 하나.',
    lineint: '선적분(Line Integral). 광선 위의 점마다 μ를 읽어 광선을 따라 잰 거리 ℓ로 적분한 값. dℓ은 x 축 방향 증분이 아니라 광선 위 길이의 증분이다.',
    fwdproj: '투영(Projection, Forward Projection). 영상 μ(x, y) 에서 광선마다 투영값 p를 만드는 선형 연산. 뒤에서 나올 역투영은 투영의 역연산이 아니다.',
    inverse: '역문제(Inverse Problem). 결과(투영값)에서 원인(μ 영상)을 구하는 문제. 재구성이 여기에 해당한다.',
    poisson: '푸아송 분포(Poisson Distribution). 일정 시간 동안 검출기에 들어온 광자 수의 표준 확률 모델. 평균이 N̄이면 분산도 N̄이다. 실제 검출기에는 근사로만 맞는다.',
    recon: '재구성(Reconstruction). 투영값(측정 데이터)에서 영상을 구하는 문제와 그 절차 전체. 역투영 한 단계와 다르다.',
    analytic: '해석적(Analytic) 재구성. 영상을 연속 함수로, 측정을 선적분으로 보고 영상을 측정값으로 나타내는 공식(역공식)을 먼저 얻는 접근. 필터 역투영(FBP)이 대표적이다.',
    algebraic: '대수적(Algebraic) 재구성. 광선마다의 투영값을 화소값의 선형식으로 쓰고 이를 모아 Ax = b 로 세워 푸는 방법. 보통 반복 계산으로 풀어서 반복(Iterative) 재구성이라고도 한다.',
    sysmat: '시스템 행렬(System Matrix) A. 행 하나가 광선 하나, 열 하나가 화소 하나이며, (i, j) 원소는 광선 i 가 화소 j 안에서 지나는 길이이다. Ax = b 의 A.'
  }
};
