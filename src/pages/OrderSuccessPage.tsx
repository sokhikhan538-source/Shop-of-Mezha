import { Check } from 'lucide-react';

type OrderSuccessPageProps = {
  orderNumber: string;
  email: string;
  shippingMethod: string;
  pickupPoint: string;
  onBack: () => void;
};

export default function OrderSuccessPage({ orderNumber, email, shippingMethod, pickupPoint, onBack }: OrderSuccessPageProps) {
  return (
    <main>
      <section className="legal-page container">
        <div className="success-icon"><Check size={28} /></div>
        <h1>ЗАКАЗ ПРИНЯТ</h1>
        <p className="legal-intro">Спасибо за заказ! Мы уже получили его и свяжемся с вами для подтверждения деталей.</p>

        <div className="order-success-details">
          <div className="order-success-row"><span>Номер заказа</span><strong>{orderNumber}</strong></div>
          <div className="order-success-row"><span>Email</span><strong>{email}</strong></div>
          <div className="order-success-row"><span>Служба доставки</span><strong>{shippingMethod}</strong></div>
          <div className="order-success-row"><span>Отделение получения</span><strong>{pickupPoint}</strong></div>
        </div>

        <p className="order-success-note">После передачи отправления в службу доставки мы отправим номер для отслеживания на указанный email.</p>

        <button className="button button-dark" onClick={onBack}>Вернуться в каталог</button>
      </section>
    </main>
  );
}
