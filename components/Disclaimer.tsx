import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const Disclaimer: React.FC = () => {
  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r mt-8">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-amber-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-amber-700">
            <strong>免責事項:</strong> 本アプリケーションはAIと検索機能を使用して金融データを取得しています。
            価格や為替レートには遅延や誤りが含まれる可能性があります。
            投資判断の根拠として使用しないでください。正確な情報は証券会社等でご確認ください。
          </p>
        </div>
      </div>
    </div>
  );
};