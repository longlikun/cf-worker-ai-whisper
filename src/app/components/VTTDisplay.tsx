import React, { useState } from 'react';

interface VTTDisplayProps {
  vttContent: string;
}

const VTTDisplay: React.FC<VTTDisplayProps> = ({ vttContent }) => {
    const [parsedData, setParsedData] = useState<
    { time: string; text: string }[]
  >([]);
  // 解析 VTT 数据
  const parseWebVTT = (data: string) => {
    const lines = data.split('\n').filter((line) => line.trim() !== ''); // 去掉空行
    const result: { time: string; text: string }[] = [];
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('-->')) {
        const time = lines[i];
        const text = lines[i + 1] || ''; // 时间后面的下一行是文本
        result.push({ time, text });
      }
    }
    setParsedData(result);
  };

  // 加载和解析数据
  React.useEffect(() => {
    parseWebVTT(vttContent);
  }, [vttContent]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">字幕 渲染</h1>
      <div className="space-y-2">
        {parsedData.map((item, index) => (
          <div key={index} className="p-2 border rounded bg-gray-50">
            <p className="text-green-500">
              <strong>时间:</strong> {item.time}
            </p>
            <p className="text-orange-400">
              <strong>字幕:</strong> {item.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VTTDisplay;