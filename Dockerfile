# ベースイメージとしてNode.jsの公式イメージを使用
FROM node:18-slim

# アプリケーションの作業ディレクトリを作成
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm install

# プロジェクトのソースコードをコピー
COPY . .

# アプリケーションがリッスンするポートを公開
EXPOSE 3000

# コンテナ起動時に実行するコマンド
CMD [ "node", "server.js" ]
