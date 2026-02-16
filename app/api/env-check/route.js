import { NextResponse } from 'next/server';

export async function GET() {
  const envVar = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  const hasKey = !!envVar;
  let parseResult = 'Not attempted';
  let error = null;
  let keySnippet = 'N/A';

  if (hasKey) {
      try {
          keySnippet = envVar.substring(0, 10) + '...';
          JSON.parse(envVar);
          parseResult = 'Success';
      } catch (e) {
          parseResult = 'Failed';
          error = e.message;
      }
  }

  return NextResponse.json({
      envVarExists: hasKey,
      keySnippet,
      parseResult,
      error,
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
  });
}
