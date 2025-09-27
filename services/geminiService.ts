

import { GoogleGenAI } from "@google/genai";
// FIX: Import HabitStatus to use the enum.
import { HabitStats, HabitStatus } from '../types';

const getMotivationalFeedback = async (
  habitName: string,
  stats: HabitStats
): Promise<string> => {
  if (!process.env.API_KEY) {
    console.error("API_KEY is not set.");
    return "APIキーが設定されていません。環境変数を確認してください。";
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const { streak, recoveryPoints, status, lastStreakBeforeReset } = stats;

  let situation: string;
  // FIX: Use HabitStatus enum members in switch cases instead of string literals.
  switch (status) {
    case HabitStatus.OnTrack:
      situation = streak > 0 ? `現在${streak}日間継続中です。素晴らしいですね！` : "新しい習慣のスタートです！";
      break;
    case HabitStatus.MissedOne:
      situation = `昨日1日休みましたが、継続は維持されています。現在の継続日数は${streak}日です。今日からまた頑張りましょう。`;
      break;
    case HabitStatus.StreakLost:
      situation = `継続がリセットされてしまいましたが、${lastStreakBeforeReset}日も続けた実績は消えません。今日から復活を目指しましょう！`;
      break;
    case HabitStatus.InRecovery:
       situation = `継続がリセットされましたが、今日と明日連続で達成すれば${lastStreakBeforeReset}日の継続記録が復活します！大きなチャンスです。`;
      break;
    default:
      situation = "現在の状況を確認中です。";
  }

  const prompt = `
あなたは、利用者を励まし、的確なアドバイスをする習慣化のプロコーチです。
以下の状況にある利用者に対して、短く（3〜4文程度）、パーソナルで、モチベーションの上がる日本語のメッセージを作成してください。

# 利用者の状況
- 習慣の名前: 「${habitName}」
- 現在の状況: ${situation}
- リカバリーポイントの数: ${recoveryPoints}個

# 指示
- 状況に応じた、具体的でポジティブなフィードバックをしてください。
- 継続中の場合は、その努力を称賛し、次の目標を意識させてください。
- 途切れた場合は、自己嫌悪に陥らせず、次への希望を持たせるような言葉を選んでください。
- リカバリーポイントの価値と、それが「保険」としてどれだけ心強いかを伝えてください。
- 厳しすぎず、甘すぎず、親身なトーンで語りかけてください。
- 回答はメッセージ本文のみとし、前置きや後書きは含めないでください。
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating content:", error);
    return "AIからのフィードバック取得中にエラーが発生しました。";
  }
};

export default getMotivationalFeedback;
