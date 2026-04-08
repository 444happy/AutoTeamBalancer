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

    let currentTeams = { blue: [], red: [] };

    const TIER_NAMES = [
        'Unranked', 'Iron', 'Bronze', 'Silver', 'Gold', 
        'Platinum', 'Emerald', 'Diamond', 'Master', 
        'Grandmaster', 'Challenger'
    ];

    const INFO_CONTENT = {
        calc: `
            <h2>티어별 점수 계산 방식</h2>
            <p>본 팀 밸런서는 각 플레이어의 실력을 객관적인 수치로 변환하여 팀 합계 점수를 최대한 비슷하게 맞춥니다. 점수 산정 방식은 다음과 같습니다.</p>
            
            <h3>1. 기본 티어 점수 (아이언 ~ 다이아몬드)</h3>
            <p>각 티어는 4단계의 세부 구분(Division)을 가집니다. 단계가 높을수록(1단계에 가까울수록) 높은 점수를 부여합니다.</p>
            <ul>
                <li>아이언 4~1: 1~4점</li>
                <li>브론즈 4~1: 5~8점</li>
                <li>실버 4~1: 9~12점</li>
                <li>골드 4~1: 13~16점</li>
                <li>플래티넘 4~1: 17~20점</li>
                <li>에메랄드 4~1: 21~24점</li>
                <li>다이아몬드 4~1: 25~28점</li>
            </ul>

            <h3>2. 상위 티어 점수 (마스터 이상)</h3>
            <p>마스터 이상의 티어는 단계 구분이 없으므로 별도의 가중치를 부여합니다.</p>
            <ul>
                <li>마스터: 32점</li>
                <li>그랜드마스터: 36점</li>
                <li>챌린저: 40점</li>
            </ul>

            <h3>3. 언랭크 (Unranked)</h3>
            <p>공식 랭크 기록이 없는 경우 기본적으로 0점으로 처리되나, 원활한 밸런싱을 위해 예상 실력에 맞는 티어를 임의로 선택하는 것을 권장합니다.</p>
        `,
        tips: `
            <h2>공정한 팀을 잘 나누는 법</h2>
            <p>성공적인 팀 구성을 위해서는 단순히 점수 합만 맞추는 것보다 중요한 요소들이 있습니다. 다음 팁들을 참고해 보세요.</p>
            
            <h3>1. 포지션(Position) 고려하기</h3>
            <p>실력이 높더라도 자신에게 익숙하지 않은 역할을 맡게 되면 실력이 급감할 수 있습니다. 가급적 양 팀의 포지션별 실력이 비슷한 수준이 되도록 배치하는 것이 중요합니다.</p>

            <h3>2. 에이스 플레이어의 균형</h3>
            <p>한 팀에 최상위 실력자가 몰려 있는 것보다, 각 팀에 핵심 플레이어를 한 명씩 나누어 배치하는 것이 박진감 넘치는 경기를 만듭니다.</p>

            <h3>3. 소통의 중요성</h3>
            <p>실력 차이가 약간 있더라도 팀워크와 소통으로 극복할 수 있습니다. 각 팀에 리더 역할을 할 수 있는 숙련된 플레이어를 한 명씩 포함시키는 것이 좋습니다.</p>

            <h3>4. 즐거운 분위기 유지</h3>
            <p>팀 나누기 도구는 결국 친목과 즐거움을 위한 것입니다. 지나친 승부욕보다는 서로를 칭찬하고 격려하는 분위기를 만드는 것이 가장 중요합니다.</p>
        `,
        privacy: `
            <h2>개인정보 처리방침</h2>
            <p>본 사이트는 사용자의 개인정보를 소중히 여기며, 다음과 같은 방침을 준수합니다.</p>
            <h3>1. 개인정보 수집 및 이용</h3>
            <p>본 사이트는 별도의 회원가입 절차가 없으며, 사용자가 입력하는 이름 등의 데이터는 서버에 저장되지 않고 오직 팀 밸런싱 계산을 위해 브라우저 메모리상에서만 사용됩니다.</p>
            <h3>2. 쿠키(Cookie) 사용 안내</h3>
            <p>구글 애드센스 등 제3자 광고 서비스를 이용하는 과정에서 사용자의 브라우저 쿠키가 수집될 수 있습니다. 이는 사용자에게 맞춤형 광고를 제공하기 위한 용도로만 사용됩니다.</p>
            <h3>3. 외부 링크</h3>
            <p>본 사이트는 제3자의 웹사이트 링크를 포함할 수 있으며, 해당 사이트의 개인정보 보호정책에 대해서는 책임을 지지 않습니다.</p>
        `,
        terms: `
            <h2>이용약관</h2>
            <p>본 사이트를 이용함으로써 귀하는 다음의 약관에 동의하게 됩니다.</p>
            <h3>1. 서비스 목적</h3>
            <p>본 사이트는 사용자 간 모임이나 게임을 돕기 위한 팀 밸런싱 도구를 무료로 제공합니다.</p>
            <h3>2. 책임 제한</h3>
            <p>본 도구를 통해 나누어진 팀 결과나 경기 결과에 대해 개발자는 어떠한 책임도 지지 않습니다. 모든 팀 구성의 최종 결정권은 사용자에게 있습니다.</p>
            <h3>3. 지적 재산권</h3>
            <p>본 사이트는 비공식 프로젝트로 운영되며, 특정 게임사의 공식 서비스가 아닙니다.</p>
            <h3>4. 약관의 변경</h3>
            <p>본 약관은 필요에 따라 사전 고지 없이 변경될 수 있습니다.</p>
        `
    };

    // Modal Events
    calcInfoBtn.addEventListener('click', () => {
        modalBody.innerHTML = INFO_CONTENT.calc;
        modalOverlay.classList.remove('hidden');
    });

    tipsInfoBtn.addEventListener('click', () => {
        modalBody.innerHTML = INFO_CONTENT.tips;
        modalOverlay.classList.remove('hidden');
    });

    privacyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        modalBody.innerHTML = INFO_CONTENT.privacy;
        modalOverlay.classList.remove('hidden');
    });

    termsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        modalBody.innerHTML = INFO_CONTENT.terms;
        modalOverlay.classList.remove('hidden');
    });

    modalClose.addEventListener('click', () => {
        modalOverlay.classList.add('hidden');
    });

    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.classList.add('hidden');
        }
    });

    // Copy to Clipboard
    copyBtn.addEventListener('click', () => {
        let text = "🎮 팀 구성 결과 🎮\n\n";
        
        text += "🟦 BLUE TEAM\n";
        currentTeams.blue.forEach(p => {
            text += `[${p.lane}] ${p.name} (${p.tierName})\n`;
        });
        
        text += "\n🟥 RED TEAM\n";
        currentTeams.red.forEach(p => {
            text += `[${p.lane}] ${p.name} (${p.tierName})\n`;
        });
        
        text += "\n#팀밸런서 #공정한게임";

        navigator.clipboard.writeText(text).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = "복사 완료!";
            copyBtn.style.backgroundColor = "#28a745";
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.backgroundColor = "";
            }, 2000);
        });
    });

    const LANE_NAMES = ['TOP', 'JUG', 'MID', 'ADC', 'SUP'];

    const SAMPLE_NAMES = [
        'User 1', 'User 2', 'User 3', 'User 4', 'User 5', 
        'User 6', 'User 7', 'User 8', 'User 9', 'User 10', 
        'User 11', 'User 12', 'User 13', 'User 14', 'User 15'
    ];

    // Add event listeners to tier selects to toggle division select
    document.querySelectorAll('.player-tier').forEach(select => {
        select.addEventListener('change', (e) => {
            const row = e.target.closest('.player-row');
            const divisionSelect = row.querySelector('.player-division');
            const tierIdx = parseInt(e.target.value);
            
            if (tierIdx === 0 || tierIdx >= 8) {
                divisionSelect.disabled = true;
                divisionSelect.style.opacity = '0.5';
            } else {
                divisionSelect.disabled = false;
                divisionSelect.style.opacity = '1';
            }
        });
    });

    randomFillBtn.addEventListener('click', () => {
        const rows = document.querySelectorAll('.player-row');
        const shuffledNames = [...SAMPLE_NAMES].sort(() => 0.5 - Math.random());
        
        rows.forEach((row, index) => {
            const nameInput = row.querySelector('.player-name');
            const laneSelect = row.querySelector('.player-lane');
            const tierSelect = row.querySelector('.player-tier');
            const divisionSelect = row.querySelector('.player-division');
            
            nameInput.value = shuffledNames[index] || `User ${index + 1}`;
            laneSelect.value = LANE_NAMES[Math.floor(Math.random() * 5)];
            
            const randomTier = Math.floor(Math.random() * 11);
            tierSelect.value = randomTier;
            
            // Random division 1-4
            divisionSelect.value = Math.floor(Math.random() * 4) + 1;

            // Trigger change to update division disabled state
            tierSelect.dispatchEvent(new Event('change'));
        });
    });

    balanceBtn.addEventListener('click', () => {
        const players = [];
        const rows = document.querySelectorAll('.player-row');
        
        rows.forEach((row, index) => {
            const nameInput = row.querySelector('.player-name');
            const laneSelect = row.querySelector('.player-lane');
            const tierSelect = row.querySelector('.player-tier');
            const divisionSelect = row.querySelector('.player-division');
            
            let name = nameInput.value.trim();
            if (!name) name = `User ${index + 1}`;
            
            const lane = laneSelect.value;
            const tierIdx = parseInt(tierSelect.value);
            const division = parseInt(divisionSelect.value);
            
            let score = 0;
            let displayTier = TIER_NAMES[tierIdx];
            
            if (tierIdx === 0) {
                score = 0;
            } else if (tierIdx >= 1 && tierIdx <= 7) {
                score = (tierIdx - 1) * 4 + (5 - division);
                displayTier += ` ${division}`;
            } else {
                if (tierIdx === 8) score = 32;
                if (tierIdx === 9) score = 36;
                if (tierIdx === 10) score = 40;
            }
            
            players.push({
                name: name,
                lane: lane,
                tierValue: score,
                tierName: displayTier
            });
        });

        const { team1, team2 } = balanceTeams(players);
        
        displayResults(team1, team2);
        resultSection.classList.remove('hidden');
        resultSection.scrollIntoView({ behavior: 'smooth' });
    });

    function balanceTeams(players) {
        const combinations = getCombinations(players, 5);
        let bestDiff = Infinity;
        let bestTeams = { team1: [], team2: [] };

        combinations.forEach(team1 => {
            const team2 = players.filter(p => !team1.includes(p));
            
            const score1 = team1.reduce((sum, p) => sum + p.tierValue, 0);
            const score2 = team2.reduce((sum, p) => sum + p.tierValue, 0);
            
            const diff = Math.abs(score1 - score2);

            if (diff < bestDiff) {
                bestDiff = diff;
                bestTeams = { team1, team2 };
            } else if (diff === bestDiff) {
                if (Math.random() > 0.5) {
                    bestTeams = { team1, team2 };
                }
            }
        });

        if (Math.random() > 0.5) {
            return { team1: bestTeams.team1, team2: bestTeams.team2 };
        } else {
            return { team1: bestTeams.team2, team2: bestTeams.team1 };
        }
    }

    function getCombinations(array, size) {
        const result = [];
        function helper(start, combo) {
            if (combo.length === size) {
                result.push([...combo]);
                return;
            }
            for (let i = start; i < array.length; i++) {
                combo.push(array[i]);
                helper(i + 1, combo);
                combo.pop();
            }
        }
        helper(0, []);
        return result;
    }

    function displayResults(blueTeam, redTeam) {
        currentTeams.blue = blueTeam;
        currentTeams.red = redTeam;

        blueTeamList.innerHTML = '';
        redTeamList.innerHTML = '';

        let blueTotal = 0;
        blueTeam.forEach(p => {
            blueTotal += p.tierValue;
            blueTeamList.appendChild(createPlayerElement(p));
        });

        let redTotal = 0;
        redTeam.forEach(p => {
            redTotal += p.tierValue;
            redTeamList.appendChild(createPlayerElement(p));
        });

        blueTeamScore.textContent = `팀 점수 합계: ${blueTotal}`;
        redTeamScore.textContent = `팀 점수 합계: ${redTotal}`;
    }

    function createPlayerElement(player) {
        const div = document.createElement('div');
        div.className = 'player-item';
        div.innerHTML = `
            <span class="player-item-lane">[${player.lane}]</span>
            <span class="player-item-name">${player.name}</span>
            <span class="player-item-tier">${player.tierName}</span>
        `;
        return div;
    }

    // Partnership Form Submission
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    const submitBtn = document.getElementById('submit-contact');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = new FormData(e.target);
            
            submitBtn.disabled = true;
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = '전송 중...';
            formStatus.textContent = '';

            try {
                const response = await fetch(e.target.action, {
                    method: 'POST',
                    body: data,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    formStatus.textContent = "✅ 문의가 성공적으로 전송되었습니다! 곧 연락드리겠습니다.";
                    formStatus.style.color = "#28a745";
                    contactForm.reset();
                } else {
                    const errorData = await response.json();
                    if (Object.hasOwnProperty.call(errorData, 'errors')) {
                        formStatus.textContent = errorData["errors"].map(error => error["message"]).join(", ");
                    } else {
                        formStatus.textContent = "❌ 전송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
                    }
                    formStatus.style.color = "#ee5b4b";
                }
            } catch (error) {
                formStatus.textContent = "❌ 네트워크 오류가 발생했습니다. 인터넷 연결을 확인해 주세요.";
                formStatus.style.color = "#ee5b4b";
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    }

});
