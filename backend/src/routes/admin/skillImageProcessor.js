const express = require('express');
const Anthropic = require('@anthropic-ai/sdk').default;
const multer = require('multer');
const { requireAuth } = require('../../middleware/auth');

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Apply auth middleware
router.use(requireAuth);

// POST /api/admin/skills/process-image
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
    }

    const anthropic = new Anthropic({ apiKey });

    // Convert image buffer to base64
    const base64Image = req.file.buffer.toString('base64');
    const mediaType = req.file.mimetype;

    // Call Claude API with the image
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: `Analyze this game skill screenshot and extract the skill information. Return ONLY a JSON object with the following structure (no markdown, no explanation):

{
  "name": {"cn": "Chinese name", "vi": "Vietnamese name"},
  "type": {"id": "type_id", "name": {"cn": "Chinese type", "vi": "Vietnamese type"}},
  "quality": "S/A/B/C",
  "trigger_rate": number or null,
  "target": "Chinese target description",
  "target_vi": "Vietnamese target description",
  "army_types": ["cavalry", "shield", "archer", "spear", "siege"],
  "effect": {"cn": "Chinese effect text", "vi": "Vietnamese effect text"},
  "innate_to": ["general names who have this as innate skill"],
  "inheritance_from": ["general names who can pass this skill"]
}

SKILL TYPE - Look for skill type in TWO places:
1. In the header bar after skill name (e.g., "S | Skill Name | Type 100%")
2. Under "Loại hình:" label on the left side

Map the type text to these IDs:
- "command" = 指挥 / Chỉ huy / Chỉ Huy
- "active" = 主动 / Chủ động / Chủ Động
- "passive" = 被动 / Bị động / Bị Động
- "pursuit" = 追击 / Truy kích / Truy Kích
- "assault" = 突击 / Đột kích / Đột Kích
- "troop" = 兵种 / Binh chủng / Binh Chủng (for troop-specific skills)
- "internal" = 内政 / Nội chính / Nội Chính (for internal affairs skills)

IMPORTANT: If the type contains "Binh chủng" or "兵种", use id "troop".

ARMY TYPES - Look for "Thích hợp:" section with small icons. Extract which troop types can use this skill:
- "cavalry" = 骑 / Kỵ (horse icon)
- "shield" = 盾 / Thuẫn (shield icon)
- "archer" = 弓 / Cung (bow icon)
- "spear" = 枪 / Thương (spear icon)
- "siege" = 器 / Khí (wheel/siege icon)

Only include army_types that are shown/highlighted. If icons are grayed out or crossed, don't include them.

TARGET - Look for "Mục tiêu:" label. Map to these target IDs:
- "self" = 自身 / Bản thân (self only)
- "ally_1" = 1名友军 / 1 đồng minh
- "ally_2" = 2名友军 / 2 đồng minh
- "ally_all" = 全体友军/我军全体/Tất cả quân ta (all allies, 3 generals)
- "ally_1_2" = 1-2名友军 / 1-2 đồng minh
- "ally_2_3" = 2-3名友军 / 2-3 đồng minh
- "enemy_1" = 1名敌军 / 1 địch
- "enemy_2" = 2名敌军 / 2 địch
- "enemy_all" = 全体敌军/敌军全体/Tất cả địch (all enemies)
- "enemy_1_2" = 1-2名敌军 / 1-2 địch
- "enemy_2_3" = 2-3名敌军 / 2-3 địch

For "target" field, return the target ID (e.g., "ally_all", "enemy_2"). For "target_vi" field, return the Vietnamese label.

Extract all visible information. If a field is not visible, use null or empty array. For effect text, preserve the exact text including numbers and percentages.`,
            },
          ],
        },
      ],
    });

    // Parse the response
    const content = response.content[0];
    if (content.type !== 'text') {
      return res.status(500).json({ error: 'Unexpected response format' });
    }

    // Try to parse JSON from the response
    let skillData;
    try {
      // Clean up the response - remove any markdown formatting
      let jsonText = content.text.trim();
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }
      skillData = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content.text);
      return res.status(500).json({
        error: 'Failed to parse skill data from image',
        raw: content.text
      });
    }

    res.json({ success: true, data: skillData });
  } catch (error) {
    console.error('Error processing skill image:', error);
    res.status(500).json({ error: 'Failed to process image: ' + error.message });
  }
});

module.exports = router;
