# Renaming script for WINTER season only
# This script will rename collection files from 7→1, 8→2, etc.

echo "🔄 Starting collection renumbering for WINTER season..."
echo "Mapping: 7→1, 8→2, ..., 21→15, 1→16, ..., 6→21"
echo ""

# Directory
DIR="/Users/admin/fashion-app/public/assets/transparent/winter"

echo "📁 Processing: winter"

if [ ! -d "$DIR" ]; then
  echo "  ⚠️  Directory not found: $DIR"
  exit 1
fi

cd "$DIR"

echo "  Step 1/2: Renaming to temporary files..."

# First pass: rename to temp files (all collections 1-21)
for i in {1..21}; do
  [ -f ${i}_1.png ] && mv ${i}_1.png temp_${i}_1.png
  [ -f ${i}_2.png ] && mv ${i}_2.png temp_${i}_2.png
  [ -f ${i}_3.png ] && mv ${i}_3.png temp_${i}_3.png
done

echo "  Step 2/2: Renaming to final names..."

# Second pass: rename to final names
# 7→1, 8→2, ..., 21→15
[ -f temp_7_1.png ] && mv temp_7_1.png 1_1.png
[ -f temp_7_2.png ] && mv temp_7_2.png 1_2.png
[ -f temp_7_3.png ] && mv temp_7_3.png 1_3.png
[ -f temp_8_1.png ] && mv temp_8_1.png 2_1.png
[ -f temp_8_2.png ] && mv temp_8_2.png 2_2.png
[ -f temp_8_3.png ] && mv temp_8_3.png 2_3.png
[ -f temp_9_1.png ] && mv temp_9_1.png 3_1.png
[ -f temp_9_2.png ] && mv temp_9_2.png 3_2.png
[ -f temp_9_3.png ] && mv temp_9_3.png 3_3.png
[ -f temp_10_1.png ] && mv temp_10_1.png 4_1.png
[ -f temp_10_2.png ] && mv temp_10_2.png 4_2.png
[ -f temp_10_3.png ] && mv temp_10_3.png 4_3.png
[ -f temp_11_1.png ] && mv temp_11_1.png 5_1.png
[ -f temp_11_2.png ] && mv temp_11_2.png 5_2.png
[ -f temp_11_3.png ] && mv temp_11_3.png 5_3.png
[ -f temp_12_1.png ] && mv temp_12_1.png 6_1.png
[ -f temp_12_2.png ] && mv temp_12_2.png 6_2.png
[ -f temp_12_3.png ] && mv temp_12_3.png 6_3.png
[ -f temp_13_1.png ] && mv temp_13_1.png 7_1.png
[ -f temp_13_2.png ] && mv temp_13_2.png 7_2.png
[ -f temp_13_3.png ] && mv temp_13_3.png 7_3.png
[ -f temp_14_1.png ] && mv temp_14_1.png 8_1.png
[ -f temp_14_2.png ] && mv temp_14_2.png 8_2.png
[ -f temp_14_3.png ] && mv temp_14_3.png 8_3.png
[ -f temp_15_1.png ] && mv temp_15_1.png 9_1.png
[ -f temp_15_2.png ] && mv temp_15_2.png 9_2.png
[ -f temp_15_3.png ] && mv temp_15_3.png 9_3.png
[ -f temp_16_1.png ] && mv temp_16_1.png 10_1.png
[ -f temp_16_2.png ] && mv temp_16_2.png 10_2.png
[ -f temp_16_3.png ] && mv temp_16_3.png 10_3.png
[ -f temp_17_1.png ] && mv temp_17_1.png 11_1.png
[ -f temp_17_2.png ] && mv temp_17_2.png 11_2.png
[ -f temp_17_3.png ] && mv temp_17_3.png 11_3.png
[ -f temp_18_1.png ] && mv temp_18_1.png 12_1.png
[ -f temp_18_2.png ] && mv temp_18_2.png 12_2.png
[ -f temp_18_3.png ] && mv temp_18_3.png 12_3.png
[ -f temp_19_1.png ] && mv temp_19_1.png 13_1.png
[ -f temp_19_2.png ] && mv temp_19_2.png 13_2.png
[ -f temp_19_3.png ] && mv temp_19_3.png 13_3.png
[ -f temp_20_1.png ] && mv temp_20_1.png 14_1.png
[ -f temp_20_2.png ] && mv temp_20_2.png 14_2.png
[ -f temp_20_3.png ] && mv temp_20_3.png 14_3.png
[ -f temp_21_1.png ] && mv temp_21_1.png 15_1.png
[ -f temp_21_2.png ] && mv temp_21_2.png 15_2.png
[ -f temp_21_3.png ] && mv temp_21_3.png 15_3.png

# 1→16, 2→17, ..., 6→21
[ -f temp_1_1.png ] && mv temp_1_1.png 16_1.png
[ -f temp_1_2.png ] && mv temp_1_2.png 16_2.png
[ -f temp_1_3.png ] && mv temp_1_3.png 16_3.png
[ -f temp_2_1.png ] && mv temp_2_1.png 17_1.png
[ -f temp_2_2.png ] && mv temp_2_2.png 17_2.png
[ -f temp_2_3.png ] && mv temp_2_3.png 17_3.png
[ -f temp_3_1.png ] && mv temp_3_1.png 18_1.png
[ -f temp_3_2.png ] && mv temp_3_2.png 18_2.png
[ -f temp_3_3.png ] && mv temp_3_3.png 18_3.png
[ -f temp_4_1.png ] && mv temp_4_1.png 19_1.png
[ -f temp_4_2.png ] && mv temp_4_2.png 19_2.png
[ -f temp_4_3.png ] && mv temp_4_3.png 19_3.png
[ -f temp_5_1.png ] && mv temp_5_1.png 20_1.png
[ -f temp_5_2.png ] && mv temp_5_2.png 20_2.png
[ -f temp_5_3.png ] && mv temp_5_3.png 20_3.png
[ -f temp_6_1.png ] && mv temp_6_1.png 21_1.png
[ -f temp_6_2.png ] && mv temp_6_2.png 21_2.png
[ -f temp_6_3.png ] && mv temp_6_3.png 21_3.png

echo "  ✅ Winter season complete!"
echo ""
echo "✨ All done! Winter files have been renumbered."