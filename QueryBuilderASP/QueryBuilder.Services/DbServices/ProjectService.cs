using System;
using System.Collections.Generic;
using System.Linq;
using QueryBuilder.Constants;
using QueryBuilder.DAL.Contracts;
using QueryBuilder.DAL.Models;
using QueryBuilder.Services.Contracts;

namespace QueryBuilder.Services.DbServices
{
    public class ProjectService: IProjectService
    {
        private readonly IUnitOfWorkFactory _unitOfWorkFactory;

        public ProjectService(IUnitOfWorkFactory unitOfWorkFactory)
        {
            _unitOfWorkFactory = unitOfWorkFactory;
        }

        public IEnumerable<Project> GetProjects()
        {
            using (var unitOfWork = _unitOfWorkFactory.GetUnitOfWork())
            {
                return unitOfWork.Projects.GetMany(p => p.Delflag == DelflagConstants.ActiveSet).OrderByDescending(g => g.CreatedDate);
            }
        }

        public void SaveProject(Project project)
        {
            if (project == null)
            {
                throw new ArgumentNullException(nameof(project));
            }

            using (var unitOfWork = _unitOfWorkFactory.GetUnitOfWork())
            {
                if (project.ProjectID == 0)
                    unitOfWork.Projects.Create(project);
                else
                    unitOfWork.Projects.Update(project);

                unitOfWork.Save();
            }
        }

        public void DeleteProject(int id)
        {         
            using (var unitOfWork = _unitOfWorkFactory.GetUnitOfWork())
            {
                unitOfWork.Projects.Delete(id);

                unitOfWork.Save();
            }
        }

        public Project GetProject(int id)
        {
            using (var unitOfWork = _unitOfWorkFactory.GetUnitOfWork())
            {
                return unitOfWork.Projects.GetById(id);
            }
        }
    }
}