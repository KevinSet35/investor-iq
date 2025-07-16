echo "📘 Building TypeScript types..."

# Build types package first
cd packages/types
npm run build

# Install built types in other packages
cd ../server
npm install ../types

cd ../client  
npm install ../types

cd ../..
echo "✅ TypeScript types built and installed"
