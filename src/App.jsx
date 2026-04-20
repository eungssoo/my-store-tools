import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Plus, Trash2, Calculator, RefreshCw, 
  Loader2, AlertCircle, Copy, Check, FileText, 
  ArrowRight, PlusCircle, Tags, Percent, Store,
  RotateCcw, DollarSign, Coins, Wallet, Play
} from 'lucide-react';

const apiKey = "AIzaSyBFdGACeDXppBG4ntS4n80HHXWjIds6XlU"; // 시스템 환경에서 API 키 주입

// ==========================================
// 1. 단가 및 판매가 계산기 컴포넌트
// ==========================================
function PricingCalculator() {
  const [rows, setRows] = useState([
    { id: Date.now(), name: '', boxPrice: '', packQty: '', markup: '65' }
  ]);

  const addRow = () => {
    const newId = Date.now();
    setRows((prev) => {
      const lastMarkup = prev.length > 0 ? prev[prev.length - 1].markup : '65';
      return [...prev, { id: newId, name: '', boxPrice: '', packQty: '', markup: lastMarkup }];
    });
    return newId;
  };

  const removeRow = (id) => {
    if (rows.length > 1) {
      setRows(rows.filter(row => row.id !== id));
    } else {
      setRows([{ id: Date.now(), name: '', boxPrice: '', packQty: '', markup: '65' }]);
    }
  };

  const updateRow = (id, field, value) => {
    setRows(rows.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const resetAll = () => {
    if (window.confirm('모든 입력 내용을 초기화하시겠습니까?')) {
      setRows([{ id: Date.now(), name: '', boxPrice: '', packQty: '', markup: '65' }]);
    }
  };

  const calculateUnitPrice = (boxPrice, packQty) => {
    const price = parseFloat(boxPrice);
    const qty = parseInt(packQty);
    if (!isNaN(price) && !isNaN(qty) && qty > 0) return (price / qty).toFixed(2);
    return '0.00';
  };

  const calculateRetailPrice = (unitPrice, markup) => {
    const price = parseFloat(unitPrice);
    const markupRate = parseFloat(markup);
    if (!isNaN(price) && !isNaN(markupRate)) {
      const rawPrice = price * (1 + markupRate / 100);
      let cents = Math.ceil(parseFloat(rawPrice.toFixed(4)) * 100);
      const lastDigit = cents % 10;
      if (lastDigit > 0 && lastDigit <= 5) cents += (5 - lastDigit);
      else if (lastDigit > 5 && lastDigit <= 9) cents += (9 - lastDigit);
      return (cents / 100).toFixed(2);
    }
    return '0.00';
  };

  const handleBoxPriceChange = (id, value) => {
    const digitsOnly = value.replace(/\D/g, '');
    if (!digitsOnly) { updateRow(id, 'boxPrice', ''); return; }
    const cents = parseInt(digitsOnly, 10);
    updateRow(id, 'boxPrice', (cents / 100).toFixed(2));
  };

  const handleKeyDown = (e, rowId, field, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (field === 'boxPrice') document.getElementById(`packQty-${rowId}`)?.focus();
      else if (field === 'packQty') document.getElementById(`markup-${rowId}`)?.focus();
      else if (field === 'markup') {
        if (index === rows.length - 1) {
          const newId = addRow();
          setTimeout(() => document.getElementById(`boxPrice-${newId}`)?.focus(), 50);
        } else {
          document.getElementById(`boxPrice-${rows[index + 1].id}`)?.focus();
        }
      }
    } else if (e.key === 'Tab') {
      if (field === 'markup' && index === rows.length - 1) {
        e.preventDefault();
        const newId = addRow();
        setTimeout(() => document.getElementById(`boxPrice-${newId}`)?.focus(), 50);
      }
    }
  };

  const handleFocus = (event) => event.target.select();

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-50 p-3 rounded-xl">
            <Calculator className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">단가 및 판매가 계산기</h1>
            <p className="text-sm text-slate-500 mt-0.5">인보이스 내역을 바탕으로 상품의 단가와 권장 판매가를 계산합니다.</p>
          </div>
        </div>
        <button onClick={resetAll} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
          <RefreshCw className="w-4 h-4" /> 전체 초기화
        </button>
      </div>

      <div className="space-y-4">
        {rows.map((row, index) => {
          const unitPrice = calculateUnitPrice(row.boxPrice, row.packQty);
          const retailPrice = calculateRetailPrice(unitPrice, row.markup);

          return (
            <div key={row.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative transition-all hover:shadow-md focus-within:ring-2 focus-within:ring-indigo-500">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500 opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
              <div className="bg-slate-50/50 border-b border-slate-100 px-5 py-3 flex justify-between items-center">
                <div className="flex items-center gap-3 flex-1">
                  <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-md tracking-wider">
                    ITEM {index + 1}
                  </span>
                  <input
                    type="text"
                    placeholder="상품명 (선택사항)"
                    value={row.name}
                    onChange={(e) => updateRow(row.id, 'name', e.target.value)}
                    className="bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-700 placeholder-slate-400 w-full outline-none"
                  />
                </div>
                <button onClick={() => removeRow(row.id)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors p-1.5 rounded-lg" title="항목 삭제">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 flex flex-col md:flex-row gap-6">
                <div className="flex-1 grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-1">Price (Ex.GST)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 font-medium">$</span>
                      <input
                        id={`boxPrice-${row.id}`} type="text" inputMode="numeric" enterKeyHint="next"
                        placeholder="0.00" value={row.boxPrice} onFocus={handleFocus}
                        onChange={(e) => handleBoxPriceChange(row.id, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, row.id, 'boxPrice', index)}
                        className="w-full pl-7 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-800 text-right font-mono font-medium"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-1">Qty per Box</label>
                    <input
                      id={`packQty-${row.id}`} type="number" min="1" enterKeyHint="next"
                      placeholder="ex) 12" value={row.packQty} onFocus={handleFocus}
                      onChange={(e) => updateRow(row.id, 'packQty', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, row.id, 'packQty', index)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-800 font-medium"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-1">Markup (%)</label>
                    <div className="relative">
                      <input
                        id={`markup-${row.id}`} type="number" step="1" enterKeyHint={index === rows.length - 1 ? "go" : "next"}
                        value={row.markup} onFocus={handleFocus}
                        onChange={(e) => updateRow(row.id, 'markup', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, row.id, 'markup', index)}
                        className="w-full pr-8 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-800 font-medium"
                      />
                      <span className="absolute right-3 top-2.5 text-slate-400 font-medium">%</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 flex flex-row gap-4 justify-between items-center bg-indigo-50/50 p-5 rounded-xl border border-indigo-100">
                  <div className="text-center flex-1">
                    <p className="text-xs font-semibold text-slate-500 mb-1">Unit Price (단가)</p>
                    <p className="text-2xl font-bold text-slate-800 font-mono tracking-tight">
                      {unitPrice !== '0.00' ? `$${unitPrice}` : '-'}
                    </p>
                  </div>
                  <div className="w-px h-10 bg-indigo-200 hidden md:block"></div>
                  <div className="text-center flex-1">
                    <p className="text-xs font-semibold text-indigo-600 mb-1">Retail Price (판매가)</p>
                    <p className="text-3xl font-black text-indigo-600 font-mono tracking-tight">
                      {retailPrice !== '0.00' ? `$${retailPrice}` : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={addRow} className="w-full py-4 border-2 border-dashed border-slate-300 rounded-2xl text-slate-500 font-bold flex items-center justify-center gap-2 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all focus:outline-none">
        <PlusCircle className="w-5 h-5" /> 새 항목 수동 추가
      </button>
    </div>
  );
}

// ==========================================
// 2. 스마트 라벨 생성기 (Multi-row 병렬 처리)
// ==========================================
function LabelGenerator() {
  // 기본적으로 3개의 입력 칸을 제공합니다.
  const [rows, setRows] = useState([
    { id: 1, text: '', result: '', loading: false, error: null, copied: false },
    { id: 2, text: '', result: '', loading: false, error: null, copied: false },
    { id: 3, text: '', result: '', loading: false, error: null, copied: false }
  ]);

  const updateRow = (id, field, value) => {
    setRows(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const addRow = () => {
    setRows(prev => [...prev, { id: Date.now(), text: '', result: '', loading: false, error: null, copied: false }]);
  };

  const removeRow = (id) => {
    setRows(prev => prev.filter(row => row.id !== id));
  };

  // 단일 항목 API 호출 함수
  const generateSingleText = async (id, textToProcess) => {
    if (!textToProcess.trim()) return;
    
    updateRow(id, 'loading', true);
    updateRow(id, 'error', null);
    updateRow(id, 'result', '');

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    const payload = {
      contents: [{ parts: [{ text: `다음 아시안 식료품 인보이스 텍스트를 분석하여 정확한 제조사명, 영문 상품명, 국문 상품명을 추출 및 번역하세요. \n인보이스 텍스트: "${textToProcess}"` }] }],
      systemInstruction: { parts: [{ text: "당신은 마트 상품 데이터 정제 AI입니다. 납품서에 불규칙하게 축약된 텍스트(예: WNG -> WANG KOREA)를 분석하여 공식 제조사명과 정확한 상품명을 도출해야 합니다. 묶음(팩) 표기는 반드시 '용량*수량pk' 형식(예: 210g*3pk)으로 표준화하세요. 반드시 제공된 JSON 스키마에 맞추어 응답하세요." }] },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            manufacturerEn: { type: "STRING", description: "제조사 영문 풀네임 (예: 'WANG KOREA', 'NONGSHIM')." },
            productEnCapacity: { type: "STRING", description: "영문 제품명과 용량 (Title Case, 예: 'Pickled Garlic 453g')." },
            productKoCapacity: { type: "STRING", description: "국문 제품명과 용량 (예: '왕 마늘 장아찌 453g')." }
          },
          required: ["manufacturerEn", "productEnCapacity", "productKoCapacity"]
        }
      }
    };

    try {
      let responseText = null;
      let delay = 1000; // 초기 대기 시간 1초

      // 안정성을 위한 자동 재시도 로직 (최대 5회)
      for (let attempt = 0; attempt <= 5; attempt++) {
        try {
          const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
          if (!res.ok) throw new Error('API 호출 오류');
          const data = await res.json();
          responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (responseText) break; // 성공 시 반복문 탈출
          throw new Error("유효한 응답 없음");
        } catch (err) {
          if (attempt === 5) throw err; // 마지막 시도까지 실패하면 에러를 던짐
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // 대기 시간을 2배씩 늘림 (1s, 2s, 4s, 8s, 16s)
        }
      }
      
      const parsedData = JSON.parse(responseText);
      const line1 = (parsedData.manufacturerEn || '').toUpperCase();
      const toTitleCase = (str) => str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
      const line2 = toTitleCase(parsedData.productEnCapacity || '');
      const line3 = parsedData.productKoCapacity || '';
      
      updateRow(id, 'result', `${line1}\n${line2}\n${line3}`);
    } catch (err) {
      updateRow(id, 'error', '서버 응답 지연으로 분석에 실패했습니다. 다시 시도해주세요.');
    } finally {
      updateRow(id, 'loading', false);
    }
  };

  // 병렬(일괄) 처리 함수
  const handleBatchGenerate = () => {
    rows.forEach(row => {
      // 텍스트가 비어있지 않고, 아직 결과가 없으며, 로딩중이 아닌 항목만 실행
      if (row.text.trim() && !row.result && !row.loading) {
        generateSingleText(row.id, row.text);
      }
    });
  };

  const handleCopy = (id, resultText) => {
    if (!resultText) return;
    const textArea = document.createElement("textarea");
    textArea.value = resultText;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      updateRow(id, 'copied', true);
      setTimeout(() => updateRow(id, 'copied', false), 2000);
    } catch (err) {
      console.error('복사 실패', err);
    } finally {
      textArea.remove();
    }
  };

  // 전체 초기화
  const resetAll = () => {
    if (window.confirm('모든 입력 내용을 초기화하시겠습니까?')) {
      setRows([
        { id: 1, text: '', result: '', loading: false, error: null, copied: false },
        { id: 2, text: '', result: '', loading: false, error: null, copied: false },
        { id: 3, text: '', result: '', loading: false, error: null, copied: false }
      ]);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 헤더 섹션 */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-100 p-3 rounded-2xl shadow-inner">
            <Tags className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">스마트 라벨 생성기</h1>
            <p className="text-sm text-slate-500 mt-0.5">여러 개의 인보이스 원문을 한 번에 입력하고 병렬로 빠르게 변환하세요.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={resetAll} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
            <RefreshCw className="w-4 h-4" /> 초기화
          </button>
          <button onClick={handleBatchGenerate} className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md active:scale-95">
            <Play className="w-4 h-4 fill-current" /> 전체 자동 변환
          </button>
        </div>
      </div>

      {/* 리스트 섹션 */}
      <div className="space-y-4">
        {rows.map((row, index) => (
          <div key={row.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all group focus-within:ring-2 focus-within:ring-indigo-500/50">
            {/* 상단 입력부 */}
            <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs bg-slate-100 px-2 py-1 rounded">
                  #{index + 1}
                </span>
                <input
                  type="text"
                  value={row.text}
                  onChange={(e) => updateRow(row.id, 'text', e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && generateSingleText(row.id, row.text)}
                  placeholder="인보이스 상품 원문 (예: WNG Pickled garlic 453g)"
                  className="w-full pl-14 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-400 transition-all outline-none font-mono text-sm text-slate-800"
                />
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => generateSingleText(row.id, row.text)}
                  disabled={row.loading || !row.text.trim()}
                  className="px-4 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-50 font-bold rounded-xl transition-colors flex items-center justify-center min-w-[80px]"
                >
                  {row.loading ? <Loader2 size={18} className="animate-spin" /> : '변환'}
                </button>
                <button
                  onClick={() => removeRow(row.id)}
                  className="px-3 py-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  title="항목 삭제"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {/* 에러 메시지 */}
            {row.error && (
              <div className="px-5 pb-4">
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
                  <AlertCircle size={16} /> <span>{row.error}</span>
                </div>
              </div>
            )}

            {/* 변환 결과창 */}
            {row.result && (
              <div className="border-t border-slate-100 bg-indigo-50/30 p-4 sm:p-5 animate-in fade-in slide-in-from-top-2">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-extrabold text-indigo-700 flex items-center gap-1.5">
                    <span className="flex items-center justify-center w-4 h-4 bg-indigo-200 text-indigo-700 rounded-full">
                      <Check size={10} strokeWidth={3} />
                    </span>
                    스마트 변환 완료
                  </span>
                  <button 
                    onClick={() => handleCopy(row.id, row.result)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white border border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 text-indigo-700 font-bold rounded-lg transition-all shadow-sm"
                  >
                    {row.copied ? <><Check size={14} /> 복사됨</> : <><Copy size={14}/> 텍스트 복사</>}
                  </button>
                </div>
                <div className="relative pl-3">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-400 rounded-full"></div>
                  <textarea
                    readOnly 
                    value={row.result} 
                    rows={3}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-800 font-mono text-sm resize-none outline-none shadow-sm"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button onClick={addRow} className="w-full py-4 border-2 border-dashed border-slate-300 rounded-2xl text-slate-500 font-bold flex items-center justify-center gap-2 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all focus:outline-none">
        <PlusCircle className="w-5 h-5" /> 새 칸 추가
      </button>

    </div>
  );
}

// ==========================================
// 3. 할인율 계산기 컴포넌트
// ==========================================
function DiscountCalculator() {
  const [items, setItems] = useState([{ id: Date.now(), price: '', discount: '', finalPrice: 0 }]);
  const priceRefs = useRef([]);
  const discountRefs = useRef([]);
  
  const scrollToElement = (element) => {
    if (element) setTimeout(() => element.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
  };

  useEffect(() => {
    if (items.length > 0) {
      const lastIndex = items.length - 1;
      if (items[lastIndex].price === '' && items[lastIndex].discount === '') {
        priceRefs.current[lastIndex]?.focus();
        scrollToElement(priceRefs.current[lastIndex]);
      }
    }
  }, [items.length]);

  const formatPosPrice = (priceStr) => {
    if (!priceStr) return '';
    const num = parseInt(priceStr, 10) / 100;
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatCalculated = (num) => {
    if (num === 0 || !num) return '0.00';
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const roundUpToZeroFiveNine = (price) => {
    let cents = Math.round(price * 100);
    let lastDigit = cents % 10;
    if (lastDigit === 0 || lastDigit === 5 || lastDigit === 9) return cents / 100;
    if (lastDigit > 0 && lastDigit < 5) cents += (5 - lastDigit);
    else if (lastDigit > 5 && lastDigit < 9) cents += (9 - lastDigit);
    return cents / 100;
  };

  const handleInputChange = (index, field, value) => {
    const newItems = [...items];
    if (field === 'price') {
      newItems[index].price = value.replace(/[^0-9]/g, '').replace(/^0+/, '');
    } else if (field === 'discount') {
       let numValue = value.replace(/[^0-9.]/g, '');
       const parts = numValue.split('.');
       if (parts.length > 2) numValue = parts[0] + '.' + parts[1];
       if (parseFloat(numValue) > 100) numValue = '100';
       newItems[index].discount = numValue;
    }

    const p = newItems[index].price ? parseInt(newItems[index].price, 10) / 100 : 0;
    const d = parseFloat(newItems[index].discount) || 0;
    let calculatedPrice = p * (1 - d / 100);
    
    if (newItems[index].price && newItems[index].discount) {
        newItems[index].finalPrice = roundUpToZeroFiveNine(calculatedPrice);
    } else {
        newItems[index].finalPrice = calculatedPrice;
    }
    setItems(newItems);
  };

  const handleKeyDown = (e, index, field) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (field === 'price') {
        discountRefs.current[index]?.focus();
      } else if (field === 'discount') {
        if (index === items.length - 1) {
          setItems([...items, { id: Date.now(), price: '', discount: '', finalPrice: 0 }]);
        } else {
          priceRefs.current[index + 1]?.focus();
        }
      }
    }
    if (e.key === 'ArrowUp' && index > 0) {
      e.preventDefault();
      if (field === 'price') priceRefs.current[index - 1]?.focus();
      if (field === 'discount') discountRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowDown' && index < items.length - 1) {
      e.preventDefault();
      if (field === 'price') priceRefs.current[index + 1]?.focus();
      if (field === 'discount') discountRefs.current[index + 1]?.focus();
    }
  };

  const removeItem = (index) => {
    if (items.length === 1) {
      setItems([{ id: Date.now(), price: '', discount: '', finalPrice: 0 }]);
      priceRefs.current[0]?.focus(); return;
    }
    setItems(items.filter((_, i) => i !== index));
    setTimeout(() => priceRefs.current[index > 0 ? index - 1 : 0]?.focus(), 0);
  };

  return (
    <div className="max-w-xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-50 p-3 rounded-xl">
            <Percent className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">빠른 할인 계산기</h1>
            <p className="text-sm text-slate-500 mt-0.5">정상가와 할인율을 입력하여 최종 할인가를 계산합니다. (POS 스타일)</p>
          </div>
        </div>
      </div>

      {items.map((item, index) => (
        <div key={item.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500 transition-all relative group">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500 opacity-0 group-focus-within:opacity-100 transition-opacity rounded-l-2xl"></div>
          
          <div className="flex justify-between items-center mb-4 pl-2">
            <span className="font-bold text-slate-500 text-xs bg-slate-100 px-2.5 py-1 rounded-md tracking-wider">ITEM {index + 1}</span>
            <button onClick={() => removeItem(index)} className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors" tabIndex="-1">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-3 mb-4 pl-2">
            <div className="flex-1 relative">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-1">정상가 ($)</label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-slate-400 font-medium text-lg">$</span>
                <input
                  ref={(el) => (priceRefs.current[index] = el)} type="text" inputMode="numeric"
                  value={formatPosPrice(item.price)}
                  onChange={(e) => handleInputChange(index, 'price', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index, 'price')}
                  onFocus={(e) => scrollToElement(e.target)} placeholder="0.00"
                  className="w-full text-xl font-bold bg-slate-50 border-2 border-transparent rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:bg-white focus:border-indigo-400 text-right transition-all"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-center pt-6 px-1 text-slate-300"><ArrowRight className="w-5 h-5" /></div>

            <div className="w-32 relative">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-1">할인율 (%)</label>
              <div className="relative flex items-center">
                <input
                  ref={(el) => (discountRefs.current[index] = el)} type="text" inputMode="decimal"
                  value={item.discount} onChange={(e) => handleInputChange(index, 'discount', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index, 'discount')}
                  onFocus={(e) => scrollToElement(e.target)} placeholder="0" maxLength={5}
                  className="w-full text-xl font-bold bg-slate-50 border-2 border-transparent rounded-xl pr-8 pl-3 py-3 focus:outline-none focus:bg-white focus:border-indigo-400 text-right transition-all text-indigo-600"
                />
                <span className="absolute right-3.5 text-indigo-400 font-bold">%</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end items-end bg-indigo-50/50 -mx-5 -mb-5 px-5 py-5 rounded-b-2xl mt-2 ml-1.5">
             <div className="flex items-center gap-3">
               <span className="text-sm font-semibold text-indigo-600/70">최종 할인가</span>
               <span className="text-4xl font-black text-indigo-600 tracking-tight">${formatCalculated(item.finalPrice)}</span>
             </div>
          </div>
        </div>
      ))}

      <button onClick={() => setItems([...items, { id: Date.now(), price: '', discount: '', finalPrice: 0 }])}
         className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-transparent border-[2px] border-dashed border-slate-300 text-slate-500 rounded-2xl hover:border-indigo-400 hover:text-indigo-600 transition-all font-bold focus:outline-none hover:bg-indigo-50"
      >
        <PlusCircle className="w-6 h-6" /> 수동으로 항목 추가
      </button>
    </div>
  );
}

// ==========================================
// 4. 일일 현금 정산기 컴포넌트
// ==========================================
const DENOMINATIONS = [
  { id: '50d', label: '50달러', value: 50, type: 'bill' },
  { id: '20d', label: '20달러', value: 20, type: 'bill' },
  { id: '10d', label: '10달러', value: 10, type: 'bill' },
  { id: '5d', label: '5달러', value: 5, type: 'bill' },
  { id: '2d', label: '2달러', value: 2, type: 'coin' },
  { id: '1d', label: '1달러', value: 1, type: 'coin' },
  { id: '50c', label: '50센트', value: 0.5, type: 'coin' },
  { id: '20c', label: '20센트', value: 0.2, type: 'coin' },
  { id: '10c', label: '10센트', value: 0.1, type: 'coin' },
  { id: '5c', label: '5센트', value: 0.05, type: 'coin' },
];

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const DenominationRow = ({ denom, count, onCountChange, onKeyDown, assignRef, isLast }) => {
  const numericCount = count === '' ? 0 : count;
  const subtotal = numericCount * denom.value;

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
      <div className="w-20 text-slate-700 font-semibold text-base">
        {denom.label}
      </div>
      
      <div className="flex-1 flex justify-center items-center px-4">
        <div className="relative">
          <input
            ref={assignRef}
            type="number" min="0" value={count}
            onChange={(e) => onCountChange(denom.id, e.target.value)}
            onKeyDown={onKeyDown} enterKeyHint={isLast ? "done" : "next"}
            placeholder="0"
            className="w-24 text-center text-lg p-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-semibold text-slate-800"
          />
          <span className="absolute -right-6 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm font-medium">개</span>
        </div>
      </div>
      
      <div className="w-28 text-right font-mono text-slate-800 font-bold text-lg">
        {formatCurrency(subtotal)}
      </div>
    </div>
  );
};

function CashCalculator() {
  const [counts, setCounts] = useState(() => {
    const initialState = {};
    DENOMINATIONS.forEach(denom => { initialState[denom.id] = ''; });
    return initialState;
  });

  const handleCountChange = (id, value) => {
    if (value === '') { setCounts(prev => ({ ...prev, [id]: '' })); return; }
    const intValue = parseInt(value, 10);
    if (!isNaN(intValue) && intValue >= 0) {
      setCounts(prev => ({ ...prev, [id]: intValue }));
    }
  };

  const handleReset = () => {
    if (window.confirm('입력된 모든 수량을 초기화하시겠습니까?')) {
      const resetState = {};
      DENOMINATIONS.forEach(denom => { resetState[denom.id] = ''; });
      setCounts(resetState);
    }
  };

  const grandTotal = useMemo(() => {
    return DENOMINATIONS.reduce((total, denom) => {
      const count = counts[denom.id] === '' ? 0 : counts[denom.id];
      return total + (count * denom.value);
    }, 0);
  }, [counts]);

  const inputRefs = useRef([]);

  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextIndex = index + 1;
      if (nextIndex < DENOMINATIONS.length && inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
        inputRefs.current[nextIndex].select();
      }
    }
  };

  const bills = DENOMINATIONS.filter(d => d.type === 'bill');
  const coins = DENOMINATIONS.filter(d => d.type === 'coin');

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 헤더 섹션 */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-50 p-3 rounded-xl">
            <Wallet className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">현금 정산기</h1>
            <p className="text-sm text-slate-500 mt-0.5">금고에 있는 지폐와 동전의 개수를 입력하여 총액을 계산합니다.</p>
          </div>
        </div>
        <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors focus:outline-none">
          <RotateCcw className="w-4 h-4" /> 전체 초기화
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 지폐 섹션 */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 md:p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-slate-800">지폐 (Bills)</h2>
          </div>
          <div className="space-y-1">
            {bills.map(denom => {
              const index = DENOMINATIONS.findIndex(d => d.id === denom.id);
              return (
                <DenominationRow 
                  key={denom.id} denom={denom} count={counts[denom.id]}
                  onCountChange={handleCountChange} onKeyDown={(e) => handleKeyDown(e, index)}
                  assignRef={(el) => (inputRefs.current[index] = el)}
                  isLast={index === DENOMINATIONS.length - 1}
                />
              );
            })}
          </div>
        </div>

        {/* 동전 섹션 */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 md:p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <Coins className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-800">동전 (Coins)</h2>
          </div>
          <div className="space-y-1">
            {coins.map(denom => {
              const index = DENOMINATIONS.findIndex(d => d.id === denom.id);
              return (
                <DenominationRow 
                  key={denom.id} denom={denom} count={counts[denom.id]}
                  onCountChange={handleCountChange} onKeyDown={(e) => handleKeyDown(e, index)}
                  assignRef={(el) => (inputRefs.current[index] = el)}
                  isLast={index === DENOMINATIONS.length - 1}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-indigo-50/50 border border-indigo-100 p-6 sm:p-8 rounded-2xl flex flex-col sm:flex-row justify-between items-center shadow-sm mt-2">
        <div className="text-indigo-600/80 text-lg font-bold mb-2 sm:mb-0">
          총 정산 금액
        </div>
        <div className="text-4xl sm:text-5xl font-black text-indigo-600 font-mono tracking-tight">
          {formatCurrency(grandTotal)}
        </div>
      </div>

    </div>
  );
}

// ==========================================
// 메인 앱 컨테이너 (이전 탭 방식으로 복구)
// ==========================================
export default function App() {
  const [activeTab, setActiveTab] = useState('label'); // 라벨 탭을 기본값으로 엽니다.

  const tabs = [
    { id: 'pricing', label: '단가 / 판매가', icon: Calculator },
    { id: 'label', label: '라벨 생성기', icon: Tags },
    { id: 'discount', label: '할인율 계산', icon: Percent },
    { id: 'cash', label: '현금 정산', icon: Wallet } 
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 pb-20 overflow-x-hidden">
      {/* 글로벌 헤더 & 네비게이션 */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-4">
            <div className="flex items-center gap-2 text-indigo-600">
              <Store className="w-6 h-6" />
              <span className="font-black text-lg tracking-tight">StoreTools</span>
            </div>
            
            <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto hide-scrollbar">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                      isActive 
                        ? 'bg-white text-indigo-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 영역 (단일 뷰) */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'pricing' && <PricingCalculator />}
        {activeTab === 'label' && <LabelGenerator />}
        {activeTab === 'discount' && <DiscountCalculator />}
        {activeTab === 'cash' && <CashCalculator />}
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}