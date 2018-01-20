using System;

namespace QueryBuilder.DAL.Infrastructure
{
    public class Disposable: IDisposable
    {
        private bool _disposed;

        ~Disposable()
        {   
            Dispose(false);
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }
        private void Dispose(bool disposing)
        {
            if (!_disposed && disposing)
            {
                DisposeCore();
            }

            _disposed = true;
        }

        protected virtual void DisposeCore()
        {
        }

    }
}