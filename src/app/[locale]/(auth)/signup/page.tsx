import { Link } from '@/i18n/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { setRequestLocale, getTranslations } from 'next-intl/server';

export default async function SignupPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Enable static rendering
  setRequestLocale(locale);
  
  const t = await getTranslations('Auth.signup');

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center">{t('title')}</h1>
        </div>
        
        <LoginForm mode="signup" />
        
        <div className="mt-6 text-center">
          <p className="text-muted-foreground">
            {t('loginPrompt')}{' '}
            <Link 
              href="/login" 
              className="text-primary hover:underline font-medium"
            >
              {t('loginLinkText')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}