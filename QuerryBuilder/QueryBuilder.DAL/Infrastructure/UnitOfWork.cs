using System;
using QueryBuilder.DAL.Contexts;
using QueryBuilder.DAL.Contracts;
using QueryBuilder.DAL.Repositories;

namespace QueryBuilder.DAL.Infrastructure
{
    public class UnitOfWork : Disposable, IUnitOfWork
    {
        private QueryBuilderContext _context;
        private readonly object _lockObject = new object();
        private readonly IDatabaseFactory _databaseFactory;

        private ConnectionDBRepository _connectionDbRepository;
        private ProjectsRepository _projectsRepository;
        private ProjectsShareRepository _projectsShareRepository;
        private QueriesRepository _queriesRepository;
        private UsersRepository _usersRepository;

        public QueryBuilderContext QueryBuilderContext
        {
            get { return _context ?? (_context = _databaseFactory.Get()); }
        }

        public UnitOfWork(IDatabaseFactory databaseFactory)
        {
            _databaseFactory = databaseFactory;
        }

        public IConnectionDBRepository ConnectionDBs
        {
            get
            {
                if (_connectionDbRepository == null)
                {
                    lock (_lockObject)
                    {
                        if (_connectionDbRepository == null)
                        {
                            _connectionDbRepository = new ConnectionDBRepository(_databaseFactory);
                        }
                    }
                }
                return _connectionDbRepository;
            }
        }

        public IProjectRepository Projects
        {
            get
            {
                if (_projectsRepository == null)
                {
                    lock (_lockObject)
                    {
                        if (_projectsRepository == null)
                        {
                            _projectsRepository = new ProjectsRepository(_databaseFactory);
                        }
                    }
                }
                return _projectsRepository;
            }
        }

        public IProjectsShareRepository ProjectsShares
        {
            get
            {
                if (_projectsShareRepository == null)
                {
                    lock (_lockObject)
                    {
                        if (_projectsShareRepository == null)
                        {
                            _projectsShareRepository = new ProjectsShareRepository(_databaseFactory);
                        }
                    }
                }
                return _projectsShareRepository;
            }
        }

        public IQueryRepository Queries
        {
            get
            {
                if (_queriesRepository == null)
                {
                    lock (_lockObject)
                    {
                        if (_queriesRepository == null)
                        {
                            _queriesRepository = new QueriesRepository(_databaseFactory);
                        }
                    }
                }
                return _queriesRepository;
            }
        }

        public IUsersRepository Users
        {
            get
            {
                if (_usersRepository == null)
                {
                    lock (_lockObject)
                    {
                        if (_usersRepository == null)
                        {
                            _usersRepository = new UsersRepository(_databaseFactory);
                        }
                    }
                }
                return _usersRepository;
            }
        }

        protected override void DisposeCore()
        {
            lock (_lockObject)
            {
                _connectionDbRepository = null;
                _projectsRepository = null;
                _projectsShareRepository = null;
                _queriesRepository = null;
                _usersRepository = null;
            }
            QueryBuilderContext.Dispose();
        }

        public void Save()
        {
            QueryBuilderContext.SaveChanges();
        }
    }
}