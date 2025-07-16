echo "📘 Running TypeScript type checking..."

echo "🔍 Checking types package..."
cd packages/types
npx tsc --noEmit

echo "🔍 Checking server package..."
cd ../server
npx tsc --noEmit

echo "🔍 Checking client package..."
cd ../client
npx tsc --noEmit

cd ../..
echo "✅ All TypeScript checks passed"
