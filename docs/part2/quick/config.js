/* 2편 빠르게 보기 교재 설정 — assets/book.js가 읽는다. 구조는 ../detail/config.js 와 ../../part1/quick/config.js 와 같다.
   장 id 는 day1~day7 이다. book.js 의 "N장 페이지 M" 자동 링크는 chNN id 만 찾으므로,
   이 편에서 본편(자세히 보기)이나 다른 날을 가리킬 때는 <a href="..."> 로 명시 링크를 쓴다.
   storePrefix 는 1편 빠르게 보기('ctreconq'), 2편 자세히 보기('ctrecon2')와 달라야 한다.
   terms 는 day1~day7 에서 쓰는 용어를 모두 담는다. */
window.BOOK_CONFIG = {
  title: 'CT 재구성 2편 빠르게 보기',
  subtitle: '7일 만에 보는 대수적 재구성과 TV 정규화',
  storePrefix: 'ctrecon2q',
  shortName: '2편 빠르게 보기',   // 다른 편에서 돌아가기 버튼에 붙이는 이름
  book: [
    { id: 'day1', num: '1일차', title: '재구성을 Ax = b로 쓰기: 순투영 A, 역투영 Aᵀ', part: '대수적 재구성의 기초', screens: 5, hours: 0.9, ready: true },
    { id: 'day2', num: '2일차', title: '한 광선씩, 또는 한꺼번에: ART·SIRT·SART', part: '대수적 재구성의 기초', screens: 5, hours: 0.9, ready: true },
    { id: 'day3', num: '3일차', title: '언제 멈출까? 목적함수, 불량조건, 반 수렴', part: '대수적 재구성의 기초', screens: 5, hours: 0.9, ready: true },
    { id: 'day4', num: '4일차', title: '데이터가 모자라거나 잡음이 있으면: 정규화와 TV', part: '정규화와 TV', screens: 6, hours: 1.1, ready: true },
    { id: 'day5', num: '5일차', title: 'TV를 계산하는 법: GPBB(사영 + BB 스텝)', part: '정규화와 TV', screens: 6, hours: 1.1, ready: true },
    { id: 'day6', num: '6일차', title: '잡음 크기를 제약으로: ASD-POCS(사영 + TV 하강)', part: '정규화와 TV', screens: 6, hours: 1.1, ready: true },
    { id: 'day7', num: '7일차', title: 'FBP 대 반복법, 1·2편 돌아보기', part: '정리', screens: 5, hours: 0.9, ready: true }
  ],
  terms: {
    _smoke: '런타임 점검용 항목. 지우지 않는다.',
    sysmat: '시스템 행렬(System Matrix) A. 행 하나가 광선 하나, 열 하나가 화소 하나이고, (i, j) 원소 aᵢⱼ 는 광선 i 가 화소 j 에 기여하는 가중치(가장 단순한 모델에서는 광선이 화소 안에서 지나는 길이)이다. 1편에서 쓰던 길이 가중 wᵢⱼ 와 같은 것을 2편에서는 aᵢⱼ 로 쓴다. Ax = b 의 A.',
    sparse: '희소 저장(Sparse Storage). 행렬에서 0이 아닌 값과 그 위치(열 번호)만 저장하는 방법. 시스템 행렬은 한 행에서 0이 아닌 원소가 전체 열의 1% 미만이어서 모든 원소를 저장하는 방식보다 훨씬 작은 공간으로 저장할 수 있다.',
    fwdproj: '순투영(Forward Projection) Ax. 추정한 영상 x 를 넣었을 때 나오는 예측 측정값. 광선마다 지나는 화소의 값에 aᵢⱼ 를 곱해 더한다. 1편에서 영상으로 투영값을 만들던 계산을 화소 격자에서 한 것과 같다.',
    backproj: '역투영(Back Projection) Aᵀd. 광선마다의 값 d 를 그 광선이 지나는 화소에 aᵢⱼ 배로 흩뿌려 더하는 계산이며 A 의 전치를 곱하는 것과 같다. 투영의 역연산이 아니다. 1편에서 본 역투영을 행렬로 쓴 것이다.',
    fbp: '필터 역투영(Filtered Back Projection, FBP). 1편의 해석적 재구성 방법. 투영마다 램프 필터를 적용한 뒤 역투영해 더하며, 공식을 한 번 계산하면 끝난다.',
    transpose: '전치(Transpose) Aᵀ. 행렬의 행과 열을 맞바꾼 행렬. A 의 i행 j열 원소가 Aᵀ 의 j행 i열 원소가 된다. 광선(행) 기준의 표를 화소(열) 기준으로 다시 읽는 것이다.',
    inner: '내적(Inner Product) ⟨a, c⟩. 길이가 같은 두 벡터의 같은 자리 성분을 곱해 모두 더한 수, Σⱼ aⱼcⱼ. 행렬과 벡터의 곱 Ax 의 각 성분은 A 의 한 행과 x 의 내적이다.',
    adjoint: '수반(Adjoint). 모든 x, d 에 대해 ⟨Ax, d⟩ = ⟨x, Bd⟩ 를 만족하는 연산 B. 실수 벡터와 행렬에서는 B 가 정확히 전치 Aᵀ 이다. 측정 쪽에서 재도 영상 쪽에서 재도 같은 값이 나온다는 뜻이며, 그래서 역투영은 투영의 수반이다.',
    matched: '짝(Matched Pair). 순투영 행렬 A 와 역투영에 쓰는 행렬 B 가 B = Aᵀ 를 만족하는 관계. B ≠ Aᵀ 이면 짝이 맞지 않는다(Unmatched)고 하며, 반복 알고리즘이 수렴하지 않거나 풀려던 문제와 다른 점으로 수렴할 수 있다.',
    onthefly: '즉석 계산(On-the-fly) 연산자. 시스템 행렬을 저장하지 않고, 순투영·역투영이 필요할 때마다 aᵢⱼ 를 그 자리에서 계산해 쓰는 방식. 두 연산이 같은 계산을 공유하므로 저절로 짝이 맞는다.',
    residual: '잔차(Residual) b − Ax. 지금 추정한 영상 x 가 만든 예측 측정값이 실제 측정값에서 얼마나 벗어났는지를 광선마다 나타낸 벡터. 반복 재구성은 이 잔차를 줄이는 방향으로 영상을 고친다.',
    orthproj: '사영(Projection onto a line). 한 점에서 직선(또는 평면)으로 수선을 내려 만나는 점으로 옮기는 일. CT 의 투영(X선으로 측정하는 일)과 이름이 비슷하지만 다른 뜻이며, 이 코스에서는 이 기하학적 연산만 사영이라고 쓴다.',
    art: 'ART(Algebraic Reconstruction Technique), Kaczmarz 갱신. 식 하나(광선 하나)를 정확히 만족하는 점으로 현재 추정값을 사영하는 일을 광선마다 이어서 반복하는 방법. S. Kaczmarz(1937)가 처음 제안했고, CT 에서는 Gordon·Bender·Herman(1970)이 이 이름으로 썼다.',
    sirt: 'SIRT(Simultaneous Iterative Reconstruction Technique). 영상을 고치기 전에 모든 광선의 잔차를 먼저 다 구하고, 광선 길이와 화소를 지나는 광선들의 가중 합으로 나누어 한꺼번에 반영하는 방법(Gilbert, 1972).',
    sart: 'SART(Simultaneous Algebraic Reconstruction Technique). 같은 각도(투영 하나)의 광선들을 묶어 한꺼번에 영상을 고치고, 각도 단위로 넘어가는 방법. 갱신 단위가 ART 와 SIRT 의 중간이다(Andersen·Kak, 1984).',
    sweep: '한 바퀴(Sweep, 통과, 반복 한 번). 광선 전체를 한 번씩 다 쓰는 일. ART 는 광선 하나마다, SART 는 각도 하나마다 영상을 고치며 한 바퀴를 돌고, SIRT 는 한 바퀴에 영상을 한 번 고친다.',
    relax: '완화 인자(Relaxation Parameter) τ. 갱신의 크기를 줄이는 배수. 일관된 시스템에서 ART 는 0 < τ < 2 이면 수렴한다.',
    objective: '목적함수(Objective Function). 재구성 알고리즘이 줄이려는 함수. 이 날의 예는 최소제곱 J(x) = ‖Ax − b‖².',
    lsq: '최소제곱(Least Squares). 식을 정확히 만족하는 x 가 없을 때, 잔차 크기의 제곱 ‖Ax − b‖² 이 가장 작은 x 를 고르는 방법.',
    rank: '랭크(Rank). 행렬의 행(또는 열) 가운데 서로 독립인 것의 최대 개수. 독립이란, 어느 하나도 나머지를 섞어서 만들 수 없다는 뜻이다. 열 수보다 작으면 영공간이 생긴다.',
    nullspace: '영공간(Null Space). Az = 0 을 만족하는 z 전체. 영상에 z 를 더해도 측정값이 전혀 변하지 않으므로, 영공간이 0 하나뿐이 아니면 Ax = b 의 해가 하나로 정해지지 않는다.',
    singval: '특이값(Singular Value) σ. 행렬 A 가 어떤 방향의 벡터를 몇 배로 늘리는지를 나타내는 수. 가장 큰 값 σ_max 는 가장 많이 늘리는 방향의 배수, 가장 작은 값 σ_min 은 가장 적게 늘리는 방향의 배수이다.',
    condnum: '조건수(Condition Number) κ(A) = σ_max/σ_min. 데이터의 작은 오차가 해에서 최대 몇 배까지 커질 수 있는지를 재는 수. 값이 클수록 문제가 불량조건이다.',
    illcond: '불량조건(Ill-conditioned). 조건수가 커서 측정값의 작은 오차가 해에서 크게 증폭되는 문제. 거의 같은 방향을 겨냥하는 광선들이 많을 때 나타난다.',
    semiconv: '반 수렴(Semiconvergence). 잡음이 있는 데이터에서 반복을 계속하면 참값과의 오차가 줄다가 어느 지점을 지나 다시 커지는 현상. 데이터 잔차는 계속 줄어든다.',
    discrepancy: '불일치 원칙(Discrepancy Principle). 데이터 잔차 ‖Ax − b‖ 가 측정 잡음의 기대 크기와 비슷해지는 반복에서 멈추는 규칙(Morozov, 1966).',
    /* 4일차 */
    regularization: '정규화(Regularization). 조건수가 커서 작은 잡음도 크게 증폭되는 문제에서, 목적함수에 항을 더해 그 증폭을 가라앉히는 방법. 조기 종료와 달리 반복 횟수와 상관없이 세기(λ)를 직접 조절할 수 있다.',
    tikhonov: 'Tikhonov 정규화. 목적함수에 λ‖x‖²(또는 화소 사이 차이의 제곱)을 더해 해의 크기(또는 매끈함)를 누르는 정규화. 작은 λ로도 조건수가 큰 문제의 증폭을 가라앉히지만, λ가 커지면 진짜 구조까지 비례해서 흐린다.',
    sparsity: '희소성(Sparsity). 벡터(또는 영상의 기울기)의 성분 대부분이 정확히 0이고 일부만 0이 아닌 성질. CT 영상은 화소 값 자체는 희소하지 않지만 화소 사이의 차이(기울기)는 대부분 0이다.',
    l1norm: 'L1 노름(L1 Norm) ‖v‖₁. 성분의 절댓값을 모두 더한 값. 제곱해 더하는 L2 노름과 달리, 벌점으로 쓰면 작은 성분을 정확히 0으로 만든다.',
    softthr: 'soft-threshold(부드러운 문턱 함수). 절댓값이 λ 이하이면 0, 그보다 크면 λ만큼 줄여 부호를 유지하는 함수. 이웃 화소 차이에 L1 벌점을 걸었을 때의 풀이이다.',
    tv: 'Total Variation(TV). 화소 사이 차이(기울기)의 크기를 모두 더한 값. 등방(가로·세로를 한 번에 묶어 재는 방식)과 이방(따로 더하는 방식)이 있다(Rudin·Osher·Fatemi, 1992). 기울기에 L1 정규화를 거는 것과 같다.',
    penalform: '벌점형(Penalized Form). 데이터와의 차이 ‖Ax−b‖²에 정규화 항 λ·TV(x)를 더한 목적함수를 최소화하는 형태. λ로 두 항의 비중을 정한다.',
    constrform: '제약형(Constrained Form). 데이터와의 차이를 ε 이하로 묶어 두고 그 안에서 TV(x)를 최소화하는 형태. ε은 측정 잡음의 크기와 연결된다.',
    huber: 'Huber 평활화. TV처럼 절댓값(또는 노름)이 들어가 미분할 수 없는 함수를, 원점 근처(크기 ≤ δ)만 2차식으로 둥글리고 그 바깥은 그대로 두어 어디서나 미분 가능하게 만드는 방법. δ가 작을수록 원래 함수에 가깝지만 경사하강법의 걸음을 더 작게 잡아야 한다.',
    cs: '압축 센싱(Compressed Sensing). 참값이 희소하면 미지수 수보다 훨씬 적은 측정으로도 복원할 수 있다는 결과(Candès·Romberg·Tao, 2006; Donoho, 2006). 측정이 희소한 기저에 대해 비간섭적일 때 성립한다.',
    incoherence: '비간섭성(Incoherence). 측정 하나하나가 희소한 신호(또는 기울기)의 어느 한두 성분에 쏠리지 않고 모든 성분에 골고루 걸쳐 있는 성질. 압축 센싱이 성립하는 조건 가운데 하나이며, CT의 정해진 각도 패턴은 이를 엄밀히 만족하지 않는다.',
    sparseview: '희소 투영각 CT(Sparse-View CT). 촬영 각도의 수를 줄여 듬성듬성 찍는 CT. 여기서 뷰(View)는 한 각도에서 얻은 투영 하나이고, 각도를 줄이면 측정 수가 화소 수보다 훨씬 적어져 Ax = b의 해가 하나로 정해지지 않는다. 방사선량과 촬영 시간을 줄이려는 목적으로 연구된다.',
    rmse: 'RMSE(Root Mean Square Error, 참값과의 오차). 재구성 영상과 참값 영상의 화소별 차이를 제곱해 평균한 뒤 제곱근을 취한 값. 작을수록 참값에 가깝다. 참값을 아는 팬텀 실험에서만 계산할 수 있다.',
    staircase: '계단 아티팩트(Staircase Artifact). TV 정규화의 λ를 너무 크게 잡으면 완만하게 변하는 영역까지 평평한 구간들로 쪼개져 계단 모양이 생기는 현상.',
    /* 5일차 */
    gp: '기울기 사영(Gradient Projection, GP). 기울기 방향으로 한 걸음 내려간 뒤, 그 점이 허용된 집합(제약) 밖이면 집합 안의 가장 가까운 점으로 다시 당겨오는 제약 있는 최적화 방법. 비음수 제약에서는 걸음마다 음수 성분을 0으로 자른다.',
    bb: 'Barzilai–Borwein(BB) 스텝. 지나온 두 점과 그때의 기울기 차이로 헤시안의 곡률을 어림해 걸음 크기 α = ⟨s,s⟩/⟨s,y⟩를 반복마다 새로 정하는 방법(1988). 고유값을 몰라도 쓸 수 있지만 목적함수가 매 반복 줄어든다는 보장은 없다.',
    gpbb: 'GPBB(Gradient Projection + Barzilai–Borwein). 기울기 사영(GP)에 BB 스텝을 더해, 음수 금지 같은 제약을 지키면서 걸음 크기를 스스로 고르는 최적화 알고리즘. 이 코스의 TV 재구성에서는 비단조 선 탐색을 안전장치로 붙여 쓴다.',
    nonmonotone: '비단조 선 탐색(Non-monotone Line Search). 매 반복마다 목적함수가 반드시 줄어들 것을 요구하지 않고, 최근 몇 번의 값 중 최댓값을 기준으로 내려가는 방향에 비례한 작은 감소만 요구하는 선 탐색.',
    /* 6일차 */
    convexset: '볼록 집합(Convex Set). 집합 안의 어느 두 점을 잇는 선분도 항상 그 집합 안에 있는 집합. 예: 식 하나를 만족하는 점의 모임(직선이나 평면), 모든 성분이 0 이상인 영상의 모임 {x : x ≥ 0}, 데이터 조건 {x : ‖Ax − b‖ ≤ ε}. 볼록 집합 밖의 점에서 집합 안의 가장 가까운 점은 하나로 정해진다.',
    pocs: '볼록 집합으로의 사영(POCS, Projection Onto Convex Sets). 여러 볼록 집합의 공통 부분에 있는 점을, 집합마다 그 집합으로의 사영을 차례로 되풀이해 찾는 방법(Bregman, 1965; Gubin·Polyak·Raik, 1967). 공통 부분이 있으면 그 안의 한 점으로 수렴하지만, 그 가운데 어느 점인지는 정하지 않는다. ART는 집합이 모두 직선(평면)인 POCS다.',
    asdpocs: 'ASD-POCS(Adaptive Steepest Descent - Projection Onto Convex Sets). 제약형 TV(‖Ax − b‖ ≤ ε, x ≥ 0 아래에서 TV 최소화)를 푸는 방법(Sidky·Pan, 2008). 반복마다 ART 한 바퀴와 음수 자르기(POCS 단계)로 데이터 쪽으로 당기고, 길이 1로 맞춘 TV 기울기 방향으로 몇 걸음 가며, TV 걸음의 길이를 POCS 단계의 이동 거리에 맞춰 조절한다. 제약형의 해로 수렴한다는 증명은 없다.',
    /* 7일차 */
    weightls: '가중 최소제곱(Weighted Least Squares). 측정마다 분산에 반비례하는 가중치 wᵢ = 1/σᵢ²를 곱해 ‖Ax−b‖² 대신 Σwᵢ(bᵢ−(Ax)ᵢ)²를 최소화하는 방법. 잡음이 큰 광선의 영향을 줄인다.',
    pwls: 'PWLS(Penalized Weighted Least Squares). 가중 최소제곱에 정규화 항(TV 등)을 더한 목적함수. X선 CT에서 광자 통계를 반영하는 실무적인 틀이다.'
  }
};
