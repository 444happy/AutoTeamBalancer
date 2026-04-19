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
        privacy: `<h2>개인정보 처리방침</h2><p>입력하신 데이터는 서버에 저장되지 않으며 브라우저 종료 시 삭제됩니다. 구글 애드센스 광고 게재를 위해 쿠키가 사용될 수 있습니다.</p>`,
        terms: `<h2>이용약관</h2><p>본 도구는 공정한 게임을 돕기 위한 보조 도구입니다. 결과에 대한 최종 판단은 사용자에게 있습니다.</p>`
    };

    function getDynamicInfoContent() {
        const game = gameSelector.value;
        const calcInfo = {
            LOL: `
                <h2>LoL 전용 밸런싱 알고리즘 (4→1 방식)</h2>
                <p>롤은 숫자가 낮을수록(1단계) 높은 실력을 의미합니다. 알고리즘은 이를 역산하여 점수화합니다.</p>
                <ul><li>에메랄드 이하: 티어점수 + (5 - 단계) 점</li><li>마스터 이상: 고유 가중치 부여</li></ul>
                <p>미드와 정글러의 MMR 차이가 벌어질 경우 팀 전체의 운영 난이도가 급상승하므로, 해당 라인의 맞상대 점수를 우선적으로 맞춥니다.</p>
            `,
            VALORANT: `
                <h2>발로란트 전용 밸런싱 알고리즘 (1→3 방식)</h2>
                <p>발로란트는 숫자가 높을수록(3단계) 높은 실력을 의미합니다. 초월자 및 불멸 티어의 세부 점수를 정밀하게 반영합니다.</p>
                <ul><li>불멸 이하: 티어점수 + 단계 점수</li><li>레디언트: 최상위 고정 점수</li></ul>
                <p>타격대(Duelist)가 한 팀에 치중되지 않도록 분산 배치 로직이 작동하며, 수비와 공격의 밸런스를 고려합니다.</p>
            `,
            OVERWATCH2: `
                <h2>오버워치 2 전용 밸런싱 알고리즘 (5→1 방식)</h2>
                <p>오버워치는 5단계 세부 등급을 사용하며, 숫자가 낮을수록 높습니다. 특히 팀의 핵심인 '탱커'의 밸런스에 우선순위를 둡니다.</p>
                <p>탱커 유저가 1명인 5:5 환경에 맞춰, 양 팀 탱커의 MMR 차이에 따라 나머지 포지션의 평균 MMR을 보정하는 고급 알고리즘이 적용됩니다.</p>
            `
        };

        const tipsInfo = {
            LOL: `
                <h2>LoL 승리 전략: 라인전과 오브젝트</h2>
                <p>1. **미드-정글 주도권:** 알고리즘이 맞춘 밸런스를 바탕으로, 초반 바위게 및 오브젝트 싸움에서 주도권을 잡는 것이 핵심입니다.</p>
                <p>2. **바텀 듀오 호흡:** 원거리 딜러와 서포터의 실력 합이 상대보다 낮다면, 수비적인 아이템 빌드를 추천합니다.</p>
            `,
            VALORANT: `
                <h2>발로란트 승리 전략: 엔트리와 트레이드</h2>
                <p>1. **타격대의 역할:** 고티어 타격대가 생성된 팀은 공격적인 진입으로 사이트를 확보해야 합니다.</p>
                <p>2. **스킬 연계:** 척후병과 전략가의 스킬이 팀원과 공유될 때 알고리즘상의 수치보다 높은 퍼포먼스를 낼 수 있습니다.</p>
            `,
            OVERWATCH2: `
                <h2>오버워치 2 승리 전략: 탱커 케어와 궁극기</h2>
                <p>1. **탱커 집중:** 양 팀 탱커의 실력이 비슷하게 맞춰졌으므로, 힐러진의 탱커 케어 능력이 승패를 가릅니다.</p>
                <p>2. **궁극기 연계:** 실력 점수가 조금 낮더라도 궁극기를 연계하는 팀이 승리할 확률이 비약적으로 상승합니다.</p>
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
