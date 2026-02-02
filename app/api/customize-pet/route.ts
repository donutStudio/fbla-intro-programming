import { streamText, Output } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY, // <-- this is where your key is used
});

const appearanceSchema = z.object({
  color: z.enum(["rose", "sky", "emerald", "amber", "lavender"]).nullable(),
  eyeStyle: z.enum(["round", "sparkle", "sleepy"]).nullable(),
  accessory: z.enum(["none", "bow", "hat", "bandana"]).nullable(),
  wingStyle: z.enum(["none", "angel", "fairy"]).nullable(),
});

export async function POST(req: Request) {
  const { prompt, currentAppearance } = await req.json();

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: `You are a helpful pet customization assistant. The user wants to customize their virtual pet's appearance.

Current pet appearance:
- Color: ${currentAppearance?.color ?? "rose"}
- Eye Style: ${currentAppearance?.eyeStyle ?? "round"}
- Accessory: ${currentAppearance?.accessory ?? "none"}
- Wing Style: ${currentAppearance?.wingStyle ?? "none"}

Available options:
- Colors: rose (pink), sky (blue), emerald (green), amber (yellow/orange), lavender (purple)
- Eye Styles: round (normal), sparkle (shiny with highlights), sleepy (half-closed)
- Accessories: none, bow (pink hair bow), hat (black top hat), bandana (orange bandana)
- Wing Styles: none, angel (white feathery wings), fairy (purple translucent wings)

Based on the user's request, determine which appearance properties they want to change. Only include properties that should be changed - leave others as null.
For example, if they say "make my pet blue", only set color to "sky" and leave the rest as null.
If they say "give my pet sparkly eyes and angel wings", set eyeStyle to "sparkle" and wingStyle to "angel".`,
    prompt,
    output: Output.object({
      schema: z.object({
        appearance: appearanceSchema,
        message: z.string().describe("A friendly response explaining the changes made"),
      }),
    }),
  });

  return result.toTextStreamResponse();
}
