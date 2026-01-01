#!/bin/bash
set -e

echo "🔧 Fixing Mutagen sync for pc-remote-control..."

# Step 1: Kill all mutagen processes
echo "📛 Stopping Mutagen daemon..."
pkill -9 mutagen 2>/dev/null || true
sleep 2

# Step 2: Clean up the VM directory
echo "🧹 Cleaning VM directory..."
ssh -p 2222 macos@localhost "rm -rf ~/src/pc-remote-control" || true
sleep 1

# Step 3: Restart mutagen daemon
echo "🚀 Starting Mutagen daemon..."
mutagen daemon start
sleep 2

# Step 4: Create new sync session with proper ignores
echo "🔄 Creating new sync session..."
mutagen sync create \
  --name="pc-remote-control" \
  --ignore="node_modules" \
  --ignore=".expo" \
  --ignore=".git" \
  --ignore=".turbo" \
  --ignore="android/build" \
  --ignore="ios/build" \
  --ignore="dist" \
  --ignore=".next" \
  --ignore="*.log" \
  --ignore=".DS_Store" \
  /media/novo_hd/projects/pc-remote-control \
  macos@localhost:2222:~/src/pc-remote-control

echo "⏳ Waiting for initial sync (this may take a minute)..."
sleep 10

# Step 5: Check status
echo "📊 Sync status:"
mutagen sync list pc-remote-control

echo ""
echo "✅ Done! Your files should now sync automatically."
echo "💡 To monitor sync: mutagen sync monitor pc-remote-control"
echo "🔍 To check sync: ssh -p 2222 macos@localhost 'ls -la ~/src/pc-remote-control'"
