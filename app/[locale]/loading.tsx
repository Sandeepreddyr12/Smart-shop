import { getTranslations } from 'next-intl/server'
import Spinner from '@/components/shared/header/spinner'

export default async function LoadingPage() {
  const t = await getTranslations()
  return (
    <div className="flex flex-col items-center justify-center min-h-screen  ">
      <div className="p-6 rounded-lg shadow-md w-1/3 text-center bg-slate-200">
        <Spinner />
        <div> {t('Loading.Loading')}</div>
      </div>
    </div>
  );
}
