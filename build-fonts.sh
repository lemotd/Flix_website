#!/bin/bash
# 从 index.html 提取所有用到的字符，重新生成字体子集
# 依赖：pip3 install fonttools brotli

# 需要保留完整字体源文件的路径
FONT_SRC="fonts/src"
OUT_DIR="fonts"

python3 -c "
import re, html
with open('index.html', 'r') as f:
    text = re.sub(r'<[^>]+>', ' ', html.unescape(f.read()))
chars = ''.join(sorted(set(text.strip())))
with open('/tmp/font-chars.txt', 'w') as f:
    f.write(chars)
print(f'提取到 {len(chars)} 个字符')
"

for weight in Regular Medium Demibold; do
  src="$FONT_SRC/MiSans-${weight}.otf"
  out="$OUT_DIR/MiSans-${weight}.woff2"
  if [ -f "$src" ]; then
    python3 -m fontTools.subset "$src" \
      --text-file=/tmp/font-chars.txt \
      --output-file="$out" \
      --flavor=woff2
    echo "✓ $out ($(du -sh "$out" | cut -f1))"
  else
    echo "✗ 源文件不存在: $src"
  fi
done
