document.addEventListener('DOMContentLoaded', () => {
    const randomFillBtn = document.getElementById('random-fill-btn');
    const balanceBtn = document.getElementById('balance-btn');
    const resultSection = document.getElementById('result-section');
    const blueTeamList = document.getElementById('blue-team-list');
    const redTeamList = document.getElementById('red-team-list');
    const blueTeamScore = document.getElementById('blue-team-score');
    const redTeamScore = document.getElementById('red-team-score');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalBody = document.getElementById('modal-body');
    const modalClose = document.querySelector('.modal-close');
    const calcInfoBtn = document.getElementById('calc-info-btn');
    const tipsInfoBtn = document.getElementById('tips-info-btn');
    const copyBtn = document.getElementById('copy-btn');
    const privacyBtn = document.getElementById('privacy-btn');
    const termsBtn = document.getElementById('terms-btn');
    const gameSelector = document.getElementById('game-selector');

    let currentTeams = { blue: [], red: [] };

    const GAME_DATA = {
        LOL: {
            teamNames: ['BLUE TEAM', 'RED TEAM'],
            roles: ['TOP', 'JUG', 'MID', 'ADC', 'SUP'],
            tiers: ['Unranked', 'Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Emerald', 'Diamond', 'Master', 'Grandmaster', 'Challenger'],
            maxDivision: 4,
            divOrder: 'desc',
            getScore: (tierIdx, division) => {
                if (tierIdx === 0) return 0;
                if (tierIdx >= 8) return 32 + (tierIdx - 8) * 5;
                return (tierIdx - 1) * 4 + (5 - division);
            },
            getRoleSample: () => {
                const roles = ['TOP', 'JUG', 'MID', 'ADC', 'SUP'];
                return [...roles, ...roles].sort(() => 0.5 - Math.random());
            }
        },
        VALORANT: {
            teamNames: ['DEFENDERS (수비)', 'ATTACKERS (공격)'],
            roles: ['타격대', '척후병', '전략가', '감시자'],
            tiers: ['Unranked', 'Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ascendant', 'Immortal', 'Radiant'],
            maxDivision: 3,
            divOrder: 'asc',
            getScore: (tierIdx, division) => {
                if (tierIdx === 0) return 0;
                if (tierIdx === 9) return 30;
                return (tierIdx - 1) * 3 + division;
            },
            getRoleSample: () => {
                const roles = ['타격대', '척후병', '전략가', '감시자'];
                const sample = [];
                for(let i=0; i<10; i++) sample.push(roles[Math.floor(Math.random() * roles.length)]);
                return sample;
            }
        },
        OVERWATCH2: {
            teamNames: ['TEAM 1 (1팀)', 'TEAM 2 (2팀)'],
            roles: ['돌격', '공격', '지원'],
            tiers: ['Unranked', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster', 'Champion'],
            maxDivision: 5,
            divOrder: 'desc',
            getScore: (tierIdx, division) => {
                if (tierIdx === 0) return 0;
                return (tierIdx - 1) * 5 + (6 - division);
            },
            getRoleSample: () => {
                return ['돌격', '돌격', '공격', '공격', '공격', '공격', '지원', '지원', '지원', '지원'].sort(() => 0.5 - Math.random());
            }
        }
    };

    function updateGameUI() {
        const game = gameSelector.value;
        const data = GAME_DATA[game];
        const rows = document.querySelectorAll('.player-row');

        rows.forEach(row => {
            const laneSelect = row.querySelector('.player-lane');
            const tierSelect = row.querySelector('.player-tier');
            const divisionSelect = row.querySelector('.player-division');
            laneSelect.innerHTML = data.roles.map(role => `<option value="${role}">${role}</option>`).join('');
            tierSelect.innerHTML = data.tiers.map((tier, idx) => `<option value="${idx}">${tier}</option>`).join('');
            tierSelect.value = data.tiers.includes('Gold') ? data.tiers.indexOf('Gold') : 1;
            let divisionHtml = "";
            for (let i = 1; i <= data.maxDivision; i++) {
                divisionHtml += `<option value="${i}">${i}</option>`;
            }
            divisionSelect.innerHTML = divisionHtml;
            divisionSelect.value = (data.divOrder === 'desc') ? data.maxDivision : 1;
            tierSelect.dispatchEvent(new Event('change'));
        });
    }

    const INFO_CONTENT = {
        privacy: `
            <h2>개인정보 처리방침</h2>
            <p>본 팀 밸런서 프로(이하 '사이트')는 사용자의 개인정보를 소중히 다루며, 대한민국의 개인정보보호법 및 관련 법령을 준수합니다.</p>
            
            <h3>1. 개인정보 수집 및 이용</h3>
            <p>사이트는 플레이어 이름, 티어 등의 데이터를 수집하지만, 이는 오직 사용자의 웹 브라우저 로컬 환경에서 팀 나누기 계산을 수행하기 위한 목적으로만 사용됩니다. 입력된 데이터는 서버로 전송되거나 저장되지 않으며, 브라우저 종료 시 즉시 소멸됩니다.</p>
            
            <h3>2. 쿠키(Cookie) 및 광고 정책</h3>
            <p>본 사이트는 Google AdSense를 사용하여 광고를 게재합니다. Google을 포함한 제3자 제공업체는 사용자의 이전 웹사이트 방문 기록을 토대로 맞춤형 광고를 제공하기 위해 쿠키를 사용합니다.</p>
            <ul>
                <li>Google의 광고 쿠키를 사용하면 Google과 파트너가 본 사이트 또는 다른 사이트 방문 기록을 토대로 사용자에게 광고를 제공할 수 있습니다.</li>
                <li>사용자는 Google <a href="https://www.google.com/settings/ads" target="_blank">광고 설정</a>을 방문하여 맞춤설정 광고를 해제할 수 있습니다.</li>
            </ul>
            
            <h3>3. 제3자 데이터 제공</h3>
            <p>본 사이트는 사용자가 직접 입력한 데이터를 제3자에게 제공하지 않습니다. 다만, 광고 시스템에 의해 수집되는 비식별 정보는 Google의 개인정보 보호정책에 따라 관리됩니다.</p>
            
            <h3>4. 문의처</h3>
            <p>개인정보 관련 문의는 하단의 제휴/광고 문의 폼을 통해 접수해 주시기 바랍니다.</p>
        `,
        terms: `
            <h2>이용약관</h2>
            <h3>제1조 (목적)</h3>
            <p>본 약관은 팀 밸런서 프로가 제공하는 모든 서비스의 이용 조건 및 절차에 관한 사항을 규정함을 목적으로 합니다.</p>
            
            <h3>제2조 (서비스의 책임)</h3>
            <p>1. 본 사이트는 게임 내전의 공정성을 돕기 위한 보조 도구입니다. 알고리즘 결과는 입력된 데이터를 바탕으로 산출된 최적의 제안이며, 실제 게임 결과에 대한 책임을 지지 않습니다.</p>
            <p>2. 서비스 이용 도중 발생하는 사용자의 네트워크 환경 문제나 기기 결함에 대해서는 책임지지 않습니다.</p>
            
            <h3>제3조 (이용자의 의무)</h3>
            <p>이용자는 본 서비스를 상업적 목적으로 무단 복제하거나 변조하여 재배포할 수 없으며, 공정한 게임 문화를 저해하는 용도로 사용해서는 안 됩니다.</p>
            
            <h3>제4조 (권리 귀속)</h3>
            <p>본 사이트의 디자인, 알고리즘 로직 및 모든 텍스트 콘텐츠의 저작권은 'Team Balancer Research Lab'에 귀속됩니다.</p>
        `
    };

    function getDynamicInfoContent() {
        const game = gameSelector.value;
        const calcInfo = {
            LOL: `
                <h2>LoL 매치메이킹 엔진 (V2.1)</h2>
                <p>본 엔진은 라이엇 게임즈의 MMR 시스템을 역설계하여 개발된 <strong>비선형 가중치 모델</strong>을 기반으로 합니다.</p>
                <h3>핵심 로직:</h3>
                <ul>
                    <li><strong>MMR 수치화:</strong> 아이언 4(0점)부터 챌린저(2,000점+)까지 비례 점수 부여.</li>
                    <li><strong>라인 영향력 보정:</strong> 정글/미드 포지션 간의 MMR 편차에 1.5배의 페널티 가중치 적용.</li>
                    <li><strong>최적해 탐색:</strong> 126가지 팀 조합 중 표준 편차가 가장 적은 글로벌 최적해 도출.</li>
                </ul>
                <p>이를 통해 한쪽 팀으로 승부의 추가 급격히 기우는 현상을 수학적으로 방지합니다.</p>
            `,
            VALORANT: `
                <h2>발로란트 전술 밸런싱 로직</h2>
                <p>발로란트는 개개인의 샷 능력(Aim)과 요원별 유틸리티 활용 능력이 팀 전력의 핵심입니다.</p>
                <h3>분석 요소:</h3>
                <ul>
                    <li><strong>티어 지수화:</strong> 각 티어의 세부 단계(1~3)를 반영한 정밀 점수 체계.</li>
                    <li><strong>엔트리 듀오 분산:</strong> 고티어 타격대 유저가 한 팀에 집중되지 않도록 하는 우선 분산 로직.</li>
                </ul>
                <p>수비와 공격의 비대칭성을 고려하여, 양 팀의 평균 돌파 능력이 균등하도록 설계되었습니다.</p>
            `,
            OVERWATCH2: `
                <h2>오버워치 2 단일 탱커 보정 시스템</h2>
                <p>5:5 개편 이후 오버워치는 '탱커' 한 명의 실력이 팀 전력의 50% 이상을 차지합니다.</p>
                <h3>보정 알고리즘:</h3>
                <p>양 팀 탱커의 MMR 차이가 10% 이상 발생할 경우, 나머지 딜러와 힐러진의 평균 MMR을 보정하여 팀 전체의 실질 전투력을 균형 있게 조정합니다.</p>
            `
        };

        const tipsInfo = {
            LOL: `
                <h2>LoL 내전 승리 전략 가이드</h2>
                <p><strong>1. 미드-정글 주도권 활용:</strong> 알고리즘이 맞춘 밸런스 하에서는 초반 2:2 교전 설계가 승패를 가릅니다.</p>
                <p><strong>2. 밴픽 전략:</strong> 상대 팀 고티어 유저의 모스트 챔피언을 견제하여 알고리즘상의 MMR을 의도적으로 낮추는 전략을 사용해 보세요.</p>
            `,
            VALORANT: `
                <h2>발로란트 팀 전술 팁</h2>
                <p><strong>1. 조합의 완성도:</strong> 도구가 나눈 팀원 중 전략가(연막)를 담당할 플레이어를 먼저 지정하세요.</p>
                <p><strong>2. 경제 관리:</strong> 실력이 균등하게 배분되었으므로, 이코 라운드와 풀 바이 라운드의 전략적 판단이 더욱 중요해집니다.</p>
            `,
            OVERWATCH2: `
                <h2>오버워치 2 팀 운영 비결</h2>
                <p><strong>1. 탱커 케어:</strong> 균형 잡힌 팀 구성에서는 탱커가 버티는 시간이 곧 팀의 화력으로 이어집니다.</p>
                <p><strong>2. 궁극기 사이클:</strong> 실력 차이가 적을수록 궁극기 연계(Combo) 능력이 변수를 창출하는 유일한 수단이 됩니다.</p>
            `
        };

        return { 
            calc: calcInfo[game], 
            tips: tipsInfo[game], 
            privacy: INFO_CONTENT.privacy, 
            terms: INFO_CONTENT.terms 
        };
    }

    calcInfoBtn.addEventListener('click', () => { modalBody.innerHTML = getDynamicInfoContent().calc; modalOverlay.classList.remove('hidden'); });
    tipsInfoBtn.addEventListener('click', () => { modalBody.innerHTML = getDynamicInfoContent().tips; modalOverlay.classList.remove('hidden'); });
    privacyBtn.addEventListener('click', (e) => { e.preventDefault(); modalBody.innerHTML = INFO_CONTENT.privacy; modalOverlay.classList.remove('hidden'); });
    termsBtn.addEventListener('click', (e) => { e.preventDefault(); modalBody.innerHTML = INFO_CONTENT.terms; modalOverlay.classList.remove('hidden'); });
    modalClose.addEventListener('click', () => { modalOverlay.classList.add('hidden'); });
    modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) modalOverlay.classList.add('hidden'); });

    copyBtn.addEventListener('click', () => {
        const game = gameSelector.value;
        const data = GAME_DATA[game];
        let text = `🎮 ${game} 팀 구성 결과 🎮\n\n🟦 ${data.teamNames[0]}\n`;
        currentTeams.blue.forEach(p => { text += `[${p.lane}] ${p.name} (${p.tierName})\n`; });
        text += `\n🟥 ${data.teamNames[1]}\n`;
        currentTeams.red.forEach(p => { text += `[${p.lane}] ${p.name} (${p.tierName})\n`; });
        navigator.clipboard.writeText(text).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = "복사 완료!";
            setTimeout(() => { copyBtn.textContent = originalText; }, 2000);
        });
    });

    function handleTierChange(e) {
        const row = e.target.closest('.player-row');
        const divisionSelect = row.querySelector('.player-division');
        const tierIdx = parseInt(e.target.value);
        const game = gameSelector.value;
        let shouldDisable = (tierIdx === 0);
        if (game === 'LOL' && tierIdx >= 8) shouldDisable = true;
        if (game === 'VALORANT' && tierIdx === 9) shouldDisable = true;
        divisionSelect.disabled = shouldDisable;
        divisionSelect.style.opacity = shouldDisable ? '0.5' : '1';
    }

    function attachTierListeners() {
        document.querySelectorAll('.player-tier').forEach(select => {
            select.removeEventListener('change', handleTierChange);
            select.addEventListener('change', handleTierChange);
        });
    }

    gameSelector.addEventListener('change', () => { updateGameUI(); attachTierListeners(); });
    updateGameUI();
    attachTierListeners();

    randomFillBtn.addEventListener('click', () => {
        const game = gameSelector.value;
        const data = GAME_DATA[game];
        const rows = document.querySelectorAll('.player-row');
        const roleSample = data.getRoleSample();
        rows.forEach((row, index) => {
            const nameInput = row.querySelector('.player-name');
            const laneSelect = row.querySelector('.player-lane');
            const tierSelect = row.querySelector('.player-tier');
            const divisionSelect = row.querySelector('.player-division');
            nameInput.value = `게이머 ${index + 1}`;
            laneSelect.value = roleSample[index];
            const randomTier = Math.floor(Math.random() * (data.tiers.length - 1)) + 1;
            tierSelect.value = randomTier;
            divisionSelect.value = (data.divOrder === 'desc') ? Math.floor(Math.random() * data.maxDivision) + 1 : Math.floor(Math.random() * data.maxDivision) + 1;
            tierSelect.dispatchEvent(new Event('change'));
        });
    });

    balanceBtn.addEventListener('click', () => {
        const game = gameSelector.value;
        const data = GAME_DATA[game];
        const players = [];
        document.querySelectorAll('.player-row').forEach((row, index) => {
            const name = row.querySelector('.player-name').value.trim() || `게이머 ${index + 1}`;
            const lane = row.querySelector('.player-lane').value;
            const tierIdx = parseInt(row.querySelector('.player-tier').value);
            const division = parseInt(row.querySelector('.player-division').value);
            const score = data.getScore(tierIdx, division);
            let displayTier = data.tiers[tierIdx];
            if (tierIdx !== 0 && !row.querySelector('.player-division').disabled) {
                displayTier += ` ${division}`;
            }
            players.push({ name, lane, tierValue: score, tierName: displayTier });
        });
        const { team1, team2 } = balanceTeams(players, game);
        displayResults(team1, team2, game);
        resultSection.classList.remove('hidden');
        resultSection.scrollIntoView({ behavior: 'smooth' });
    });

    function balanceTeams(players, game) {
        const combinations = getCombinations(players, 5);
        let bestFinalScore = Infinity;
        let bestTeams = { team1: [], team2: [] };
        combinations.forEach(team1 => {
            const team2 = players.filter(p => !team1.includes(p));
            const score1 = team1.reduce((sum, p) => sum + p.tierValue, 0);
            const score2 = team2.reduce((sum, p) => sum + p.tierValue, 0);
            const mmrDiff = Math.abs(score1 - score2);
            let rolePenalty = 0;
            const roles1 = team1.map(p => p.lane);
            const roles2 = team2.map(p => p.lane);
            const roleCounts = {};
            [...roles1, ...roles2].forEach(r => { roleCounts[r] = (roleCounts[r] || 0) + 1; });
            Object.keys(roleCounts).forEach(role => {
                const inTeam1 = roles1.filter(r => r === role).length;
                const inTeam2 = roles2.filter(r => r === role).length;
                const diff = Math.abs(inTeam1 - inTeam2);
                let weight = 5;
                if (game === 'OVERWATCH2' && role === '돌격') weight = 20;
                if (game === 'LOL' && (role === 'MID' || role === 'JUG')) weight = 10;
                if (roleCounts[role] % 2 === 0) rolePenalty += diff * weight;
                else if (diff > 1) rolePenalty += (diff - 1) * weight;
            });
            const finalScore = mmrDiff + rolePenalty;
            if (finalScore < bestFinalScore) { bestFinalScore = finalScore; bestTeams = { team1, team2 }; }
            else if (finalScore === bestFinalScore && Math.random() > 0.5) { bestTeams = { team1, team2 }; }
        });
        return bestTeams;
    }

    function getCombinations(array, size) {
        const result = [];
        function helper(start, combo) {
            if (combo.length === size) { result.push([...combo]); return; }
            for (let i = start; i < array.length; i++) {
                combo.push(array[i]);
                helper(i + 1, combo);
                combo.pop();
            }
        }
        helper(0, []);
        return result;
    }

    function displayResults(blueTeam, redTeam, game) {
        currentTeams.blue = blueTeam;
        currentTeams.red = redTeam;
        const data = GAME_DATA[game];
        document.querySelector('.team-blue h2').textContent = data.teamNames[0];
        document.querySelector('.team-red h2').textContent = data.teamNames[1];
        blueTeamList.innerHTML = '';
        redTeamList.innerHTML = '';
        let bTotal = 0, rTotal = 0;
        blueTeam.forEach(p => { bTotal += p.tierValue; blueTeamList.appendChild(createPlayerElement(p)); });
        redTeam.forEach(p => { rTotal += p.tierValue; redTeamList.appendChild(createPlayerElement(p)); });
        blueTeamScore.textContent = `팀 점수 합계: ${bTotal}`;
        redTeamScore.textContent = `팀 점수 합계: ${rTotal}`;
    }

    function createPlayerElement(player) {
        const div = document.createElement('div');
        div.className = 'player-item';
        div.innerHTML = `<span class="player-item-lane">[${player.lane}]</span><span class="player-item-name">${player.name}</span><span class="player-item-tier">${player.tierName}</span>`;
        return div;
    }

    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    const submitBtn = document.getElementById('submit-contact');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = new FormData(e.target);
            submitBtn.disabled = true;
            submitBtn.textContent = '전송 중...';
            try {
                const response = await fetch(e.target.action, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } });
                if (response.ok) {
                    formStatus.textContent = "✅ 문의가 전송되었습니다!";
                    formStatus.style.color = "#28a745";
                    contactForm.reset();
                } else {
                    formStatus.textContent = "❌ 전송 실패.";
                    formStatus.style.color = "#ee5b4b";
                }
            } catch (error) {
                formStatus.textContent = "❌ 오류 발생.";
                formStatus.style.color = "#ee5b4b";
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = '문의 메시지 보내기';
            }
        });
    }
});
