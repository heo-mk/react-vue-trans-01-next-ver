const fs = require('fs');
const data = JSON.parse(fs.readFileSync('scripts/inspection-result.json', 'utf-8'));

console.log('=== SECTION SUMMARY TABLE ===');
const counts = data.sectionSplitCounts;
console.log('| 본문 영역 | 1280px (데스크톱) | 768px (태블릿) | 375px (모바일) | 합계 | 대표 단어 쪼개짐 발생 사례 |');
console.log('|:---|:---:|:---:|:---:|:---:|:---|');

const examples = {
  '파인만 핵심 요약': ['`집주인과 같 / 습니다.`', '`초인종 / (setter)을`', '`초인종을 눌 / 러야만`', '`도서관의 책이므 / 로`', '`원격 / 도서관의`'],
  '직관적 비유': ['`금고 시스템 / 과 같아서`', '`즉시 보입니 / 다.`', '`각 컴포넌 / 트가`', '`사서 / 가`', '`정밀 / 조립`'],
  '핵심 비교표 (셀)': ['`setter 함수로 명 / 시적 통보`', '`프론 / 트엔드`', '`정 / 착`', '`React.memo 필 / 요)`', '`스스 / 로 감지`', '`생태계 / :`'],
  '함정 문답 (Q&A)': ['`추적하는 런 / 타임 비용`', '`쪽을 택했습니 / 다.`', '`반응성 추 / 적 체계`', '`어디서 쓰이 / 는지`', '`정당 / 한 트레이드오프`', '`클라이언트 컴포 / 넌트`'],
  '목록 / 카드 / 기타 본문': ['`Composition / API`', '`프레임워크 상 / 호 전환`', '`렌더링 방 / 식과`']
};

for (const [sec, c] of Object.entries(counts)) {
  const sum = c[1280] + c[768] + c[375];
  const ex = (examples[sec] || []).join(', ');
  console.log(`| ${sec} | ${c[1280]}건 | ${c[768]}건 | ${c[375]}건 | ${sum}건 | ${ex} |`);
}
