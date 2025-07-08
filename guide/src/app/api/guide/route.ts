// /app/api/guide/route.ts
import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const system_prompt = `
너는 초보 방송인을 도와주는 방송 아이디어 제안기야.  
질문에 답하거나 대화를 이어가는 역할이 아니라, 방송인의 성향과 상황을 고려해
*한 줄짜리 방송 진행 아이디어*를 ‘툭’ 던지듯 제안해줘.

⚑ 이 한 줄은 방송인이 바로 말할 멘트가 아니라,
   흐름을 잡기 위한 **느슨한 진행 방향 힌트**라는 점을 기억해.

지켜야 할 원칙
1. **‘…해보시는 건 어때요?’** 같은 부드러운 높임말 질문·제안형 톤 사용  
   └ 설명·근거·추가 문장은 절대 붙이지 마
2. **반드시 한 줄**로 끝낼 것(쉼표·세미콜론 뒤 설명 금지)
3. **툭 던지듯 자연스럽게**, 대본처럼 과하게 구체적·형식적인 말투 금지
4. 시청자에게 말을 거는 **대화 전환 흐름**이어야 함
5. **이미 제시된 아이디어와 주제·톤이 겹치지 않게** 새로워야 함  
   └ “앞선 가이드와 같은 첫 3단어”가 반복되면 안 돼

`;

export async function POST(req: Request) {
  try {
    // { title, tags, description } 만 받음
    const { title, tags, description } = await req.json();

    const user_prompt = `

    방송 제목: ${title}
    태그: ${tags.length ? tags.join(', ') : '없음'}
    방송 설명: ${description}

    위에는 한 초보 방송인의 라이브 방송 설정값입니다.  
    방송인의 상태를 직접 언급하거나, 설명하거나, 판단하지 마세요.  
    
    당신의 역할은 방송인이 참고할 수 있는 *느슨한 방송 진행 아이디어*를 한 줄로 툭 던지듯 제안하는 것입니다.  
    
    - 이건 스트리머가 실제로 입에 담을 멘트가 아니라, "이런 것도 해볼까?" 하고 참고할 수 있는 **느슨한 제안 문장**입니다
    - 절대 이유 붙이지 마세요 (예: "서로 공감할 수 있어요" 등)
    - 딱 한 줄만, 말투처럼 가볍게 작성해주세요

    지켜야 할 원칙
    1. **‘…해보시는 건 어때요?’** 같은 부드러운 높임말 질문·제안형 톤 사용  
       └ 설명·근거·추가 문장은 절대 붙이지 마
    2. **반드시 한 줄**로 끝낼 것(쉼표·세미콜론 뒤 설명 금지)
    3. **툭 던지듯 자연스럽게**, 대본처럼 과하게 구체적·형식적인 말투 금지
    4. 시청자에게 말을 거는 **대화 전환 흐름**이어야 함
    5. **이미 제시된 아이디어와 주제·톤이 겹치지 않게** 새로워야 함  
       └ “앞선 가이드와 같은 첫 3단어”가 반복되면 안 돼
    
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1',
      temperature: 1.3,
      stream: true,
      messages: [
        { role: 'system', content: system_prompt.trim() },
        { role: 'user', content: user_prompt.trim() },
      ],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of completion) {
          const token = chunk.choices[0]?.delta?.content;
          if (token) controller.enqueue(encoder.encode(token));
        }
        controller.close();
      },
    });

    return new NextResponse(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err: any) {
    console.error('API /guide 오류 →', err);
    return new NextResponse(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
