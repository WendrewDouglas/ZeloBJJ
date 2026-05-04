-- 011: Adiciona coluna i18n para títulos/descrições da landing
-- Estrutura: { pt: {title, desc}, en: {title, desc}, ko: {title, desc} }
-- Permite a landing renderizar os módulos diretamente do banco em qualquer idioma
ALTER TABLE course_modules
  ADD COLUMN IF NOT EXISTS landing_i18n jsonb;

WITH seed AS (
  SELECT * FROM (VALUES
    (1,  jsonb_build_object(
      'pt', jsonb_build_object('title', 'Abertura', 'desc', 'Boas-vindas, expectativas e como aproveitar ao máximo o curso desde o primeiro vídeo.'),
      'en', jsonb_build_object('title', 'Opening', 'desc', 'Welcome, expectations, and how to make the most of the course from day one.'),
      'ko', jsonb_build_object('title', '오리엔테이션', 'desc', '환영 인사, 기대치, 그리고 첫날부터 강좌를 최대한 활용하는 방법.')
    )),
    (2,  jsonb_build_object(
      'pt', jsonb_build_object('title', 'Base e Postura', 'desc', 'Alicerce do Jiu-Jitsu. Postura, distribuição de peso e proteção corporal.'),
      'en', jsonb_build_object('title', 'Posture & Base', 'desc', 'The foundation of Jiu-Jitsu. Posture, weight distribution, and body protection.'),
      'ko', jsonb_build_object('title', '자세와 기본기', 'desc', '주짓수의 기초. 자세, 체중 배분, 신체 보호.')
    )),
    (3,  jsonb_build_object(
      'pt', jsonb_build_object('title', 'Movimentação Corporal', 'desc', 'Ponte, fuga de quadril, giro, levantada técnica e ajustes de base.'),
      'en', jsonb_build_object('title', 'Body Movement', 'desc', 'Bridge, hip escape, turning, technical stand-up, and base adjustments.'),
      'ko', jsonb_build_object('title', '신체 움직임', 'desc', '브리지, 힙 이스케이프, 회전, 테크니컬 스탠드업, 기본기 조정.')
    )),
    (4,  jsonb_build_object(
      'pt', jsonb_build_object('title', 'Hierarquia das Posições', 'desc', 'Costas, montada, controle lateral, passagem de guarda e progressão.'),
      'en', jsonb_build_object('title', 'Position Hierarchy', 'desc', 'Back, mount, side control, guard passing, and progression.'),
      'ko', jsonb_build_object('title', '포지션 위계', 'desc', '백, 마운트, 사이드 컨트롤, 가드 패스, 그리고 진행.')
    )),
    (5,  jsonb_build_object(
      'pt', jsonb_build_object('title', 'Guarda', 'desc', 'Transforme a posição inferior em ataque com guarda fechada e aberta.'),
      'en', jsonb_build_object('title', 'Guard', 'desc', 'Turn the bottom position into attack with closed and open guard.'),
      'ko', jsonb_build_object('title', '가드', 'desc', '닫힌 가드와 열린 가드로 하단 포지션을 공격으로 전환.')
    )),
    (6,  jsonb_build_object(
      'pt', jsonb_build_object('title', 'Raspagem', 'desc', 'Inversão de posições com técnica: tesoura, gancho, desequilíbrio e timing.'),
      'en', jsonb_build_object('title', 'Sweeps', 'desc', 'Position reversals with technique: scissor, hook, off-balancing, and timing.'),
      'ko', jsonb_build_object('title', '스윕', 'desc', '기술로 포지션을 뒤집기: 시저, 후크, 균형 무너뜨리기, 타이밍.')
    )),
    (7,  jsonb_build_object(
      'pt', jsonb_build_object('title', 'Finalizações', 'desc', 'Mata-leão, americana, armlock e triângulo com controle e posicionamento.'),
      'en', jsonb_build_object('title', 'Submissions', 'desc', 'Rear-naked choke, kimura, armlock, and triangle with control and positioning.'),
      'ko', jsonb_build_object('title', '서브미션', 'desc', '리어 네이키드 초크, 키무라, 암락, 트라이앵글의 통제와 포지셔닝.')
    )),
    (8,  jsonb_build_object(
      'pt', jsonb_build_object('title', 'Sobrevivência', 'desc', 'Proteção, fechamento de espaço e inteligência tática sob pressão.'),
      'en', jsonb_build_object('title', 'Survival', 'desc', 'Protection, closing space, and tactical intelligence under pressure.'),
      'ko', jsonb_build_object('title', '생존', 'desc', '보호, 공간 차단, 압박 속에서의 전술적 지능.')
    )),
    (9,  jsonb_build_object(
      'pt', jsonb_build_object('title', 'Defesa Pessoal', 'desc', 'Soluções práticas para situações de rua: defesas, controle e desengajamento seguro.'),
      'en', jsonb_build_object('title', 'Self-Defense', 'desc', 'Practical solutions for street situations: defenses, control, and safe disengagement.'),
      'ko', jsonb_build_object('title', '자기방어', 'desc', '거리 상황에 대한 실용적 솔루션: 방어, 통제, 안전한 이탈.')
    )),
    (10, jsonb_build_object(
      'pt', jsonb_build_object('title', 'Conduta e Mentalidade', 'desc', 'Respeito, constância, humildade e disciplina como aceleradores da evolução.'),
      'en', jsonb_build_object('title', 'Conduct & Mindset', 'desc', 'Respect, consistency, humility, and discipline as accelerators of evolution.'),
      'ko', jsonb_build_object('title', '태도와 마인드셋', 'desc', '존중, 꾸준함, 겸손, 그리고 진화를 가속하는 규율.')
    )),
    (11, jsonb_build_object(
      'pt', jsonb_build_object('title', 'Encerramento', 'desc', 'Próximos passos, como continuar evoluindo e integrar o aprendizado ao seu treino diário.'),
      'en', jsonb_build_object('title', 'Closing', 'desc', 'Next steps, how to keep evolving, and integrating what you learned into your daily training.'),
      'ko', jsonb_build_object('title', '마무리', 'desc', '다음 단계, 계속 발전하는 방법, 그리고 일상 훈련에 학습 내용을 통합하기.')
    ))
  ) AS s(sort_order, payload)
)
UPDATE course_modules cm
SET landing_i18n = s.payload
FROM seed s
WHERE cm.sort_order = s.sort_order;
