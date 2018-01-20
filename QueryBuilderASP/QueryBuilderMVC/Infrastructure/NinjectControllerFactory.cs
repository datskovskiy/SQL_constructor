using System;
using Ninject;
using System.Web.Mvc;
using System.Web.Routing;
using QueryBuilder.DAL.Infrastructure;
using QueryBuilder.DAL.Contracts;
using QueryBuilder.Services.Contracts;
using QueryBuilder.Services.DbServices;
using Moq;
using QueryBuilder.DAL.Models;
using System.Collections.Generic;
using System.Linq;
using QueryBuilder.Utils.Encryption;

namespace QueryBuilderMVC.Infrastructure
{
    public class NinjectControllerFactory : DefaultControllerFactory
    {
        DatabaseFactory DbFactory = new DatabaseFactory();

        private IKernel ninjectKernel;
        public NinjectControllerFactory()
        {
            ninjectKernel = new StandardKernel();
            AddBinding();
        }
        protected override IController GetControllerInstance(RequestContext requestContext, Type controllerType)
        {
            return controllerType == null
                ? null
                : (IController)ninjectKernel.Get(controllerType);
        }
        private void AddBinding()
        {
           ninjectKernel.Bind<IUnitOfWorkFactory>().To<UnitOfWorkFactory>();
            ninjectKernel.Bind<IConnectionDbService>().To<ConnectionDbService>();
            ninjectKernel.Bind<IProjectService>().To<ProjectService>();
            ninjectKernel.Bind<IUserService>().To<UserService>();
            ninjectKernel.Bind<IProjectsShareService>().To<ProjectsShareService>();
            ninjectKernel.Bind<IQueryService>().To<QueryService>();
			ninjectKernel.Bind<IQueriesHistoryService>().To<QueryHistoryService>();
            
		}
    }
}