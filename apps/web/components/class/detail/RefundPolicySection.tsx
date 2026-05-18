import { CheckCircle, XCircle, Info, AlertCircle } from 'lucide-react';

const REFUND_POLICIES = [
  { timing: '수업 3일 전', rate: '100% 환불', available: true },
  { timing: '수업 1~2일 전', rate: '50% 환불', available: true },
  { timing: '수업 당일', rate: '환불 불가', available: false },
];

const NOTES = [
  '노쇼(No-show) 시 환불이 불가합니다.',
  '원활한 수업 진행을 위해 수업 시작 5분 전까지 도착해 주세요.',
  '수업 재료 및 도구 일체는 강사가 준비합니다.',
  '클래스 당일 컨디션 불량 시, 수업 시작 전 강사에게 미리 알려주세요.',
];

export function RefundPolicySection() {
  return (
    <div className="space-y-6 rounded-[24px] border border-gray-100 bg-[#F8F9FA] p-6 md:p-8">
      {/* 환불 규정 */}
      <div>
        <h3 className="font-outfit mb-4 flex items-center gap-2 text-base font-bold text-gray-900">
          <AlertCircle className="h-4 w-4 text-[#A54729]" />
          환불 규정
        </h3>
        <div className="flex flex-col divide-y divide-gray-100 overflow-hidden rounded-[16px] border border-gray-100 bg-white shadow-sm">
          {REFUND_POLICIES.map(({ timing, rate, available }) => (
            <div key={timing} className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                {available ? (
                  <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                ) : (
                  <XCircle className="h-4 w-4 shrink-0 text-rose-500" />
                )}
                <span className="font-inter text-sm font-medium text-gray-700">{timing}</span>
              </div>
              <span
                className={`font-outfit text-sm font-bold ${
                  available ? 'text-emerald-600' : 'text-rose-500'
                }`}
              >
                {rate}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 수강 주의사항 */}
      <div>
        <h3 className="font-outfit mb-4 flex items-center gap-2 text-base font-bold text-gray-900">
          <Info className="h-4 w-4 text-blue-500" />
          수강 주의사항
        </h3>
        <ul className="flex flex-col gap-2.5">
          {NOTES.map((note) => (
            <li key={note} className="flex items-start gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
              <span className="font-inter text-sm leading-relaxed text-gray-600">{note}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
