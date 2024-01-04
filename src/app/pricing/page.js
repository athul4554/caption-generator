import PageHeaders from '@/components/PageHeaders';

export default function PricingPage() {
  return (
    <div>
      <PageHeaders h1Text="Check out our pricing" h2Text="You are our lucky customer!!!" />
      <div className="bg-white text-slate-700 rounder-lg max-w-xs mx-auto p-4 text-center">
        <h3 className="font-bold text-2xl">Free</h3>
        <h4>Grab now!!</h4>
      </div>
    </div>
  );
}
