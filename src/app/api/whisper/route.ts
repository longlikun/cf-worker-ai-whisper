import { getRequestContext } from "@cloudflare/next-on-pages";
import { NextRequest } from "next/server";
export const runtime = 'edge'

export async function POST(request: NextRequest) {
    try {
        // 检查请求是否包含文件
        const formData = await request.formData();
        const audioFile = formData.get('audio');
        console.log("formData", audioFile)

        if (!audioFile || !(audioFile instanceof Blob)) {
            return new Response(
                JSON.stringify({ error: '没有音频文件' }),
                { status: 400 }
            );
        }

        // 读取音频文件
        const audioBuffer = await audioFile.arrayBuffer();

        // 获取 Cloudflare 环境变量
        const ctx = getRequestContext();
        const { AI } = ctx.env
        const CLOUDFLARE_ACCOUNT_ID = ctx.env.CLOUDFLARE_ACCOUNT_ID;
        const CLOUDFLARE_API_TOKEN = ctx.env.CLOUDFLARE_API_TOKEN;

        if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
            return new Response(
                JSON.stringify({ error: 'Cloudflare 权限错误' }),
                { status: 500 }
            );
        }

        // 准备音频数据
        const input = {
            audio: Array.from(new Uint8Array(audioBuffer))
        };

        // 使用whisper转换
        const cloudflareResponse = await AI.run(
            "@cf/openai/whisper",
            input
        );

        console.log("Cloudflare AI response:", cloudflareResponse);
        // 调用 Cloudflare AI Whisper API
        //   const cloudflareResponse = await fetch(
        //     `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/openai/whisper`,

        //     {
        //       method: 'POST',
        //       headers: {
        //         'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        //         'Content-Type': 'application/json',
        //       },
        //       body: JSON.stringify(input) 
        //     }
        //   );


        if (!cloudflareResponse || cloudflareResponse.error) {
          return new Response(
              JSON.stringify({ error: `Whisper API Error: ${JSON.stringify(cloudflareResponse)}` }),
              { status: 500 }
          );
      }

       

        // 返回转录结果
        return new Response(

            JSON.stringify({ transcription: cloudflareResponse }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

    } catch (error) {
        console.error('Error:', error);
        return new Response(
            JSON.stringify({ error: (error as Error).message }),
            { status: 500 }
        );
    }
}
