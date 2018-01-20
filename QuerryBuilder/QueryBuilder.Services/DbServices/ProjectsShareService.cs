using System;
using System.Linq;
using QueryBuilder.Constants;
using QueryBuilder.DAL.Contracts;
using QueryBuilder.DAL.Models;
using QueryBuilder.Services.Contracts;

namespace QueryBuilder.Services.DbServices
{
    public class ProjectsShareService: IProjectsShareService
    {
        private readonly IUnitOfWorkFactory _unitOfWorkFactory;

        public ProjectsShareService(IUnitOfWorkFactory unitOfWorkFactory)
        {
            _unitOfWorkFactory = unitOfWorkFactory;
        }

        public void AddEmailToProjectsShare(Project project, string email)
        {
            if (project == null)
            {
                throw new ArgumentNullException(nameof(project));
            }

            if (string.IsNullOrWhiteSpace(email))
            {
                throw new ArgumentException("Empty email.");
            }

            using (var unitOfWork = _unitOfWorkFactory.GetUnitOfWork())
            {
                var projectsShare = unitOfWork.ProjectsShares.GetAll().FirstOrDefault(c => c.ProjectID.Equals(project.ProjectID) 
                                                                                           && c.SharedEmail.Equals(email));

                if (projectsShare != null)
                {
                    if (projectsShare.Delflag == DelflagConstants.UnactiveSet)
                    {
                        projectsShare.Delflag = DelflagConstants.ActiveSet;
                        unitOfWork.ProjectsShares.Update(projectsShare);
                    }
                    else if (projectsShare.Delflag == DelflagConstants.ActiveSet)
                    {
                        throw new ArgumentException("Email exists in projects shares.");
                    }
                }
                else 
                {
                    var newprojectsShare = new ProjectsShare
                    {
                        ProjectID = project.ProjectID,
                        SharedEmail = email
                    };

                    unitOfWork.ProjectsShares.Create(newprojectsShare);
                }
                unitOfWork.Save();
            }
        }
    }
}