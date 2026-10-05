import { Button } from '@/components/common/Button.jsx';
import { Container } from '@/components/common/Container.jsx';
import { Skeleton, StateMessage } from '@/components/common/StateMessage.jsx';
import { usePortfolio } from '@/context/PortfolioContext.jsx';

export function PortfolioGate({ children }) {
  const { status, data, error, reload } = usePortfolio();

  if (status === 'loading') {
    return (
      <Container className="py-20">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-6 h-16 w-2/3" />
        <Skeleton className="mt-4 h-8 w-1/3" />
        <Skeleton className="mt-8 h-24 max-w-xl" />
      </Container>
    );
  }

  if (status === 'error') {
    return (
      <div className="px-5 py-24">
        <StateMessage
          title="The portfolio could not be loaded"
          body={error}
          action={<Button onClick={reload}>Try again</Button>}
        />
      </div>
    );
  }

  return children(data);
}
