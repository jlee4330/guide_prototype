import LiveForm from '@/components/LiveForm';


export default function Home() {
  return (
    <main style={{padding: '20rem',textAlign: 'center' }}>
      <h1 style={{marginBottom: '3rem' }}> 라이브 방송 만들기</h1>


      <LiveForm />
    </main>
  );
}
