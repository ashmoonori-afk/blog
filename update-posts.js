const fs = require('fs');
const path = require('path');

const postsPath = path.join(__dirname, 'posts', 'posts.json');
const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));

// Find posts by title keyword
function findPost(keyword) {
  return posts.find(p => p.title.includes(keyword));
}

// Post 1: 체계적인 운영 (미식) — uses chapterHeading, pullQuote, gallery, spacer
const post1 = findPost('체계적인');
if (post1) {
  const blocks = [
    { type: 'paragraph', data: { text: '장례식장 푸드서비스는 매출 규모에 비해 관리 체계가 단순한 산업입니다. 총매출은 확인할 수 있었지만, 첫 주문과 재주문의 구조, 상품별 기여도, 이탈 구간을 명확히 설명하기는 어려웠습니다. 고객만족도 역시 체계적으로 수집되지 않았습니다.' }},
    { type: 'paragraph', data: { text: '운영은 성실했지만, 경영은 정량적으로 관리되지 않는 상태였습니다. 프레시오는 이 지점을 문제로 보았습니다. 매출을 올리기 전에, 매출을 설명할 수 있어야 한다고 판단했습니다.' }},
    { type: 'spacer', data: { size: 'md' }},
    { type: 'image', data: { caption: '', withBorder: false, withBackground: false, stretched: false, file: { url: '/uploads/1773115215711-r40fbe.png' }}},
    { type: 'spacer', data: { size: 'lg' }},
    { type: 'chapterHeading', data: { label: 'CHAPTER ONE', title: '매출 구조를 분석할 수 없었습니다' }},
    { type: 'paragraph', data: { text: '저희는 단순히 총매출을 확인하지 않았습니다. 첫 주문, 재주문, 부가 주문의 흐름을 분리하고 상품별 기여도와 이탈 구간을 재구성하려 했습니다. 하지만 기존 POS 시스템은 그런 분류를 제공하지 않았습니다.' }},
    { type: 'pullQuote', data: { text: '문제의 본질이 \'운영 역량\'이 아니라 \'구조\'에 있다는 것을 확인하는 데는 오래 걸리지 않았습니다', attribution: '프레시오 운영팀' }},
    { type: 'paragraph', data: { text: '주문 흐름도 비효율적이었습니다. 빈소에서 접수된 주문이 운영 사무실을 경유해 주방으로 전달되는 3단계 구조. 중간에 누락과 지연이 발생했고, 데이터는 어디에도 남지 않았습니다.' }},
    { type: 'spacer', data: { size: 'md' }},
    { type: 'image', data: { caption: '기존 운영 구조 분석', withBorder: false, withBackground: false, stretched: true, file: { url: '/uploads/1773115271752-1uim1t.png' }}},
    { type: 'spacer', data: { size: 'lg' }},
    { type: 'chapterHeading', data: { label: 'CHAPTER TWO', title: '데이터 기반 운영 체계를 설계하다' }},
    { type: 'paragraph', data: { text: '프레시오가 먼저 한 일은 주문-매출-만족도 데이터를 하나의 흐름으로 연결하는 것이었습니다. POS 데이터를 재구조화하고, 고객 피드백을 정량 지표로 전환했습니다.' }},
    { type: 'paragraph', data: { text: '대시보드를 만들었습니다. 일별 매출 추이, 상품별 기여율, 재주문율, NPS 점수까지 — 모든 숫자가 한 화면에서 읽히도록 설계했습니다. 운영자가 매일 아침 확인하는 습관을 만드는 것이 목표였습니다.' }},
    { type: 'pullQuote', data: { text: '호텔보다 더 체계적인 운영은 가능합니다. 데이터가 있으면, 의사결정은 빨라지고 정확해집니다.', attribution: '' }},
    { type: 'spacer', data: { size: 'sm' }},
    { type: 'chapterHeading', data: { label: 'CHAPTER THREE', title: '현장의 변화, 숫자로 증명하다' }},
    { type: 'paragraph', data: { text: '도입 6개월 후, 재주문율이 23% 상승했습니다. 이탈 구간이 명확해지면서 선제적 대응이 가능해졌고, NPS 점수는 업계 평균 대비 30포인트 이상 높아졌습니다.' }},
    { type: 'paragraph', data: { text: '가장 큰 변화는 현장 운영자의 자신감이었습니다. 감으로 판단하던 것을 숫자로 설명할 수 있게 되면서, 본사와의 커뮤니케이션도 달라졌습니다. "잘 되고 있다"가 아니라 "이 지표가 이만큼 개선되었다"고 말할 수 있게 된 것입니다.' }},
    { type: 'delimiter', data: {}},
    { type: 'paragraph', data: { text: '프레시오가 만든 건 대시보드가 아닙니다. 운영을 경영으로 전환하는 구조입니다. 호텔보다 더 체계적인 장례식장 운영 — 이것이 프레시오의 기준입니다.' }},
  ];
  post1.content = JSON.stringify({ time: Date.now(), blocks, version: '2.31.4' });
}

// Post 2: 고객경험 — uses chapterHeading, pullQuote, columns, spacer
const post2 = findPost('경험을 바꿨을까');
if (post2) {
  const blocks = [
    { type: 'paragraph', data: { text: '장례식장에서의 식사 경험. 전통적인 장례식장 상차림은 효율성을 중심으로 설계되었습니다. 많은 사람들을 빠르게 먹여야 하니까요. 하지만 조문객 입장은 다릅니다. 누군가 옆에서 밥을 덜어주고, 국을 퍼주는 과정에서 "빨리 먹어야 하나"라는 불안감이 생깁니다.' }},
    { type: 'paragraph', data: { text: '프레시오는 이 문제를 보았습니다. 처음 팀이 본 건 메뉴표가 아니라 식사 장면이었습니다. 그리고 질문을 바꿨습니다.' }},
    { type: 'spacer', data: { size: 'lg' }},
    { type: 'chapterHeading', data: { label: 'CHAPTER ONE', title: '문제를 맛에서 찾지 않고, 장면에서 찾다' }},
    { type: 'paragraph', data: { text: '다수를 효율적으로 먹이는 구조에서는 개인이 존중받는 느낌을 만들기 어렵습니다. 한 상을 공유하고, 남이 퍼주는 밥을 받아 먹고, 옆 사람의 속도에 맞춰야 하는 식사. 이 구조 자체가 "어쩔 수 없는 절차"라는 인상을 만들고 있었습니다.' }},
    { type: 'pullQuote', data: { text: '"무엇을 더 올릴까?"가 아니라 "어떤 방식으로 대접할까?"', attribution: '프레시오 CX팀' }},
    { type: 'paragraph', data: { text: '프레시오가 선택한 답은 1인 반상차림이었습니다. 단순한 메뉴 변경이 아닙니다. 한 사람을 기준으로 경험을 다시 설계하는 것입니다. 각 조문객이 자신의 상을 가집니다. 모든 음식이 이미 담겨 있어서 추가로 덜거나 퍼할 필요가 없습니다.' }},
    { type: 'columns', data: {
      image: '',
      heading: '1인 반상차림의 원칙',
      text: '<p>개인별 독립 상차림으로 존중의 경험을 설계합니다. 온도와 신선도가 일관되게 유지되며, 추가로 요청하거나 기다릴 필요 없이 모든 것이 준비되어 있습니다.</p><p>가장 중요한 것은 — 말하지 않아도 정성이 전달된다는 것입니다.</p>',
      layout: 'image-left',
      ratio: '1:2',
      width: 'wide'
    }},
    { type: 'spacer', data: { size: 'lg' }},
    { type: 'chapterHeading', data: { label: 'CHAPTER TWO', title: '현장은 느리게 바뀌지만, 한번 바뀌면 오래갑니다' }},
    { type: 'paragraph', data: { text: '변화는 항상 저항을 만납니다. 처음 1인 반상차림을 도입했을 때, 주방 팀의 반응은 회의적이었습니다. "이렇게 하면 시간이 더 오래 걸리지 않을까?" 프레시오의 운영 팀은 이것을 단순한 매뉴얼 문제로 보지 않았습니다. 현장에 직접 들어갔습니다.' }},
    { type: 'paragraph', data: { text: '주방 팀과 함께 상차림을 연습했습니다. 왜 이렇게 해야 하는지, 이것이 고객에게 어떤 의미인지를 설명했습니다. 시간이 지나면서 주방 팀은 자신들의 손으로 만든 상차림이 조문객에게 어떤 위로가 되는지를 깨달으면서, 일에 대한 자부심이 생겼습니다.' }},
    { type: 'pullQuote', data: { text: '더 정교한 운영은 더 따뜻한 경험과 함께 갈 수 있습니다', attribution: '' }},
    { type: 'paragraph', data: { text: '더 흥미로운 것은 해외 손님들의 반응이었습니다. 일본의 장례 관계자들이 쉴낙원을 방문했을 때, 그들이 가장 먼저 주목한 것은 메뉴가 아니라 운영 방식이었습니다.' }},
    { type: 'spacer', data: { size: 'lg' }},
    { type: 'chapterHeading', data: { label: 'CHAPTER THREE', title: '경험이 달라지면, 숫자도 결국 따라옵니다' }},
    { type: 'paragraph', data: { text: '1인 반상차림 도입 후, 쉴낙원의 식수 전환율이 눈에 띄게 올랐습니다. 기존에는 조문객의 약 60%가 식사를 선택했다면, 이제는 75% 이상이 식사를 합니다. 객단가도 15% 개선되었습니다.' }},
    { type: 'table', data: { withHeadings: true, content: [
      ['지표', '도입 전', '도입 후', '변화'],
      ['식수 전환율', '60%', '75%+', '+15%p'],
      ['객단가', '기준', '+15%', '↑'],
      ['NPS 평균', '42', '78', '+36p'],
      ['조문객 키워드', '"무난하다"', '"정돈되어 있다"', '긍정 변화']
    ]}},
    { type: 'paragraph', data: { text: '구글 리뷰, SNS, 입소문에서 "무난하다"는 표현이 사라졌습니다. 대신 "정돈되어 있다", "깔끔하다", "신경 쓴 느낌이 난다"는 표현이 늘어났습니다. 이것은 단순한 만족도 상승이 아닙니다. 브랜드 이미지의 변화입니다.' }},
    { type: 'delimiter', data: {}},
    { type: 'paragraph', data: { text: '프레시오가 복원한 건 상차림이 아니라, 대접의 감각입니다. 사람을 기준으로 설계하면, 신뢰는 자연스럽게 숫자로 이어집니다.' }},
  ];
  post2.content = JSON.stringify({ time: Date.now(), blocks, version: '2.31.4' });
}

// Post 3: BX 재설계 (브랜드) — uses chapterHeading, pullQuote, columns, list, spacer
const post3 = findPost('아름다운 이별');
if (post3) {
  const blocks = [
    { type: 'paragraph', data: { text: '쉴낙원 서울 장례식장은 오랫동안 "장례를 치른다"기보다 "아름다운 이별을 돕는다"는 관점으로 장례식장을 운영해왔습니다. 이 철학은 문구나 슬로건에 머물지 않고, 현장에서 근무하는 직원들의 태도와 말투, 유가족을 대하는 자세 속에 자연스럽게 스며들어 있었습니다.' }},
    { type: 'paragraph', data: { text: '그러나 문제는 철학 그 자체가 아니라 전달 방식이었습니다. 이 진정성과 소명 의식이 고객이 마주하는 수많은 접점 — 온라인 정보, 인쇄물, 공간 안내 — 모두에서 일관된 경험으로 체감되고 있는가에 대한 질문이 남아 있었습니다.' }},
    { type: 'spacer', data: { size: 'lg' }},
    { type: 'chapterHeading', data: { label: 'CHAPTER ONE', title: '온라인에서의 첫 인상이, 신뢰의 기준이 되다' }},
    { type: 'paragraph', data: { text: '유가족이 장례식장을 처음 접하는 순간은 대부분 온라인입니다. 웹사이트, 네이버 플레이스, 블로그 검색 결과 — 이 첫 접점에서의 인상이 장례식장에 대한 신뢰의 기준을 만듭니다.' }},
    { type: 'columns', data: {
      image: '',
      heading: '디지털 접점 재설계',
      text: '<p>웹사이트의 구조, 문장의 톤, 이미지의 품질, 정보의 위계를 다시 정렬했습니다. 화려하게 만드는 것이 아니라, 현장의 태도가 온라인에서도 동일하게 느껴지도록 정제하는 작업이었습니다.</p>',
      layout: 'image-right',
      ratio: '2:1',
      width: 'wide'
    }},
    { type: 'pullQuote', data: { text: '장례식장의 브랜드는 시설이 아니라 태도로 완성됩니다', attribution: '' }},
    { type: 'spacer', data: { size: 'md' }},
    { type: 'chapterHeading', data: { label: 'CHAPTER TWO', title: '진심은 가장 작은 디테일에서 드러납니다' }},
    { type: 'paragraph', data: { text: '브랜드 철학은 선언이 아니라 디테일을 통해 체감됩니다. 퇴실 시 건네받는 영수증 케이스, 안내문 한 줄, 봉투의 질감 — 고객은 이 작은 접점에서 장례식장의 수준을 감지합니다.' }},
    { type: 'list', data: { style: 'unordered', items: [
      '절제된 타이포그래피 — 차분하고 명확한 서체 선택',
      '차분한 색감 — 과하지 않은 무채색 기반 팔레트',
      '균형 잡힌 여백 — 정보의 밀도보다 호흡을 우선',
      '일관된 톤 — 모든 산출물이 같은 태도를 유지'
    ]}},
    { type: 'pullQuote', data: { text: '브랜드는 과함이 아니라 절제에서 완성됩니다', attribution: '프레시오 BX팀' }},
    { type: 'spacer', data: { size: 'lg' }},
    { type: 'chapterHeading', data: { label: 'CHAPTER THREE', title: '조문객의 경험은 곧 브랜드의 얼굴입니다' }},
    { type: 'paragraph', data: { text: '설계된 브랜드 경험은 현장에서 사람을 통해 전달됩니다. 아무리 정제된 산출물이 있어도, 응대하는 사람의 태도가 다르면 브랜드는 무너집니다. 프레시오는 쉴낙원 서울의 접객 톤, 제공 흐름, 응대 기준을 철학에 맞게 정렬하는 작업을 진행했습니다.' }},
    { type: 'paragraph', data: { text: '친절보다 존중, 속도보다 정확성. 누가 응대하더라도 동일한 온도와 태도가 유지되도록 구조를 맞추는 데 집중했습니다.' }},
    { type: 'spacer', data: { size: 'md' }},
    { type: 'chapterHeading', data: { label: 'CHAPTER FOUR', title: '사람을 대하는 태도가 브랜드가 됩니다' }},
    { type: 'paragraph', data: { text: '장례식장에서 일하는 사람들은 눈에 띄는 일을 하지 않습니다. 그러나 그들이 하는 일은 세상에서 가장 중요하고 조심스러운 일입니다. 누군가의 마지막 시간을 정리하고, 남은 사람들의 감정을 조심스럽게 배려하며, 말보다 태도로 위로를 전하는 일.' }},
    { type: 'pullQuote', data: { text: '브랜드는 사람이 어떻게 일하는지로 기억됩니다', attribution: '' }},
    { type: 'delimiter', data: {}},
    { type: 'paragraph', data: { text: '"아름다운 이별"의 철학은 이제 경험의 언어가 되었습니다. 일하는 사람들의 태도와 철학이 고객 경험 전반에서 일관되게 전달될 때 비로소 완성됩니다.' }},
  ];
  post3.content = JSON.stringify({ time: Date.now(), blocks, version: '2.31.4' });
}

// Post 4: 육개장 R&D — uses chapterHeading, pullQuote, columns, code (recipe), table, spacer
const post4 = findPost('한 그릇');
if (post4) {
  const blocks = [
    { type: 'paragraph', data: { text: '장례식장에서 육개장은 단순한 메뉴가 아닙니다. 조문객이 먼 길을 와서, 슬픔 속에서 받아드는 첫 번째 온기입니다. 그런데 저희가 처음 현장에 들어섰을 때, 그 한 그릇에는 기준이 없었습니다.' }},
    { type: 'paragraph', data: { text: '누가 끓이느냐에 따라 맛이 달랐고, 대량 조리로 넘어가는 순간 국물은 탁해지고 고기는 퍼졌습니다. 수백 명분을 한꺼번에 끓여야 하는 현장의 압박 속에서, "정성"이라는 말은 의지의 문제로만 남아 있었습니다.' }},
    { type: 'spacer', data: { size: 'lg' }},
    { type: 'chapterHeading', data: { label: 'CHAPTER ONE — THE UNSPOKEN PROBLEM', title: '아무도 의심하지 않던 육개장의 민낯' }},
    { type: 'paragraph', data: { text: '장례식장 육개장은 오랫동안 "어차피 이런 음식"이라는 인식 속에 방치되어 왔습니다. 조문객이 가장 먼저 접하는 음식이지만, 대부분의 현장에서 대량 조리 시 품질이 급격히 저하됩니다.' }},
    { type: 'columns', data: {
      image: '',
      heading: '기존 조리 방식의 한계',
      text: '<p>경력 있는 조리사의 감에 의존하는 방식이 유일한 기준이었습니다. 레시피가 있어도 완전히 계량화·공정화되지 않아 사람이 바뀌면 맛이 달라지고, 대량 전환 시 품질 저하를 막을 수단이 없었습니다.</p>',
      layout: 'image-left',
      ratio: '1:1',
      width: 'normal'
    }},
    { type: 'pullQuote', data: { text: '이 구조를 바꾸지 않으면, 육개장은 관행적이고 기대 없는 메뉴로 남게 됩니다', attribution: '' }},
    { type: 'spacer', data: { size: 'lg' }},
    { type: 'chapterHeading', data: { label: 'CHAPTER TWO — BUILDING THE STANDARD', title: '감을 숫자로 바꾸다' }},
    { type: 'paragraph', data: { text: '이번 프로젝트의 출발점은 단순한 레시피 개선이 아니었습니다. 수도권 육개장 맛집과 대구 지역 대표 매장을 직접 방문해 국물의 농도, 향의 깊이, 대파·고사리 사용 방식, 고기 결 처리, 매운맛의 결을 비교했습니다.' }},
    { type: 'paragraph', data: { text: '소고기능이육개장. 이름부터 재료의 본질을 걸었습니다. 개발 과정은 집요했습니다.' }},
    { type: 'table', data: { withHeadings: true, content: [
      ['공정 항목', '기존 방식', '표준화 이후'],
      ['육수 농도', '조리사 감각', 'Brix 1.8 ± 0.2 기준'],
      ['고기 투입량', '대략 계량', '1인분 85g 정량'],
      ['대파 처리', '비표준', '3cm 사선컷, 숨김 2분'],
      ['고춧가루 투입', '개인차 큼', '온도 85°C 시점 투입'],
      ['최종 검수', '없음', '3인 블라인드 테스트']
    ]}},
    { type: 'spacer', data: { size: 'md' }},
    { type: 'paragraph', data: { text: '식재료 선별 기준을 세웠습니다. 투입량과 순서를 수치화했습니다. 조리 온도, 시간, 불 조절의 타이밍까지 — 감에 의존하던 모든 공정을 문서와 숫자로 치환했습니다.' }},
    { type: 'pullQuote', data: { text: '현장에서 모은 인사이트를 표준으로 바꿀 때, 한 그릇의 품질은 매번 증명됩니다', attribution: 'R&D팀' }},
    { type: 'spacer', data: { size: 'lg' }},
    { type: 'chapterHeading', data: { label: 'CHAPTER THREE — HANDS IN THE FIELD', title: '설득하지 않았습니다. 끓여서 보여드렸습니다' }},
    { type: 'paragraph', data: { text: '표준화의 진짜 난관은 종이 위가 아니라 현장에 있었습니다. 수년간 자기 방식으로 끓여온 조리팀에게 "이제부터 이렇게 하십시오"라고 말하는 건, 그들의 경험을 부정하는 것처럼 들릴 수 있습니다.' }},
    { type: 'paragraph', data: { text: '저희는 설득 대신 시연을 택했습니다. 직접 끓여 보여드리고, 전후 차이를 함께 맛보게 했습니다. 결과가 설득보다 강했고, 그제야 현장의 손이 움직이기 시작했습니다.' }},
    { type: 'spacer', data: { size: 'md' }},
    { type: 'chapterHeading', data: { label: 'CHAPTER FOUR — PROOF', title: '감각이 아닌 구조가 품질을 만듭니다' }},
    { type: 'paragraph', data: { text: '이 프로젝트의 결론은 단순합니다. 표준화된 공정만으로, 조리자가 누구든 동일한 품질의 육개장을 매일 재현할 수 있다는 것을 증명했습니다. 이것은 맛있는 육개장을 만든 이야기가 아닙니다. 음식의 품질은 감각이 아니라 구조에서 나온다는 것을 증명하는 프로젝트입니다.' }},
    { type: 'delimiter', data: {}},
    { type: 'paragraph', data: { text: '표준화는 정성의 반대가 아닙니다. 정성을 지속하는 유일한 방법입니다. 한 그릇의 기준을 다시 세우는 것, 그것이 프레시오의 방식입니다.' }},
  ];
  post4.content = JSON.stringify({ time: Date.now(), blocks, version: '2.31.4' });
}

fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2), 'utf8');
console.log('All 4 posts updated with editorial blocks');
