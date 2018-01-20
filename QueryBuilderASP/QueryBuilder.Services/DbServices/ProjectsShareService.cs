using System;
using System.Collections.Generic;
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

        public void AddUserToProjectsShare(Project project, ApplicationUser user, int userRole, ApplicationUser fromUser = null)
        {
            if (project == null)
            {
                throw new ArgumentNullException(nameof(project));
            }

            if (user == null)
            {
                throw new ArgumentNullException(nameof(user));
            }

            if (userRole < UserRoleProjectsShareConstants.Invited && userRole > UserRoleProjectsShareConstants.Owner)
            {
                throw new ArgumentNullException(nameof(userRole));
            }

            using (var unitOfWork = _unitOfWorkFactory.GetUnitOfWork())
            {
                var projectsShare = unitOfWork.ProjectsShares.GetAll().FirstOrDefault(c => c.ProjectId.Equals(project.ProjectID)
                                            && c.UserId.Equals(user.Id));

                if (projectsShare != null)
                {
                    if (projectsShare.UserRole > UserRoleProjectsShareConstants.Invited)
                    {
                        throw new ArgumentException("User exists in projects share.");
                    }

                    projectsShare.UserRole = userRole;
                    unitOfWork.ProjectsShares.Update(projectsShare);
                }
                else
                {
                    var newprojectsShare = new ProjectsShare
                    {
                        ProjectId = project.ProjectID,
                        UserId = user.Id,
                        UserRole = userRole
                    };

                    if (fromUser != null)
                    {
                        newprojectsShare.FromUserId = fromUser.Id;
                    }

                    unitOfWork.ProjectsShares.Create(newprojectsShare);
                }
              
                unitOfWork.Save();
            }
        }

        public IEnumerable<Project> GetUserProjects(ApplicationUser user)
        {
            if (user == null)
            {
                throw new ArgumentNullException(nameof(user));
            }

            using (var unitOfWork = _unitOfWorkFactory.GetUnitOfWork())
            {
                return unitOfWork.ProjectsShares.GetMany(p => (p.UserId == user.Id && p.User.Delflag == DelflagConstants.ActiveSet && p.Project.Delflag == DelflagConstants.ActiveSet))
                                .Select(f => f.Project).ToList().OrderByDescending(g => g.CreatedDate);
            }
        }

        public IEnumerable<ApplicationUser> GetProjectUsers(Project project)
        {
            if (project == null)
            {
                throw new ArgumentNullException(nameof(project));
            }

            using (var unitOfWork = _unitOfWorkFactory.GetUnitOfWork())
            {
                return unitOfWork.ProjectsShares.GetMany(p => p.ProjectId == project.ProjectID).Select(f => f.User).ToList();
            }
        }

        public int GetUserRole(ApplicationUser user, int projectId)
        {
            if (user == null)
            {
                throw new ArgumentNullException(nameof(user));
            }

            if (projectId == 0)
            {
                throw new ArgumentNullException(nameof(projectId));
            }

            using (var unitOfWork = _unitOfWorkFactory.GetUnitOfWork())
            {
                return unitOfWork.ProjectsShares.GetMany(p => (p.UserId == user.Id && p.ProjectId == projectId))
                                                        .First().UserRole;
                
            }
        }

        public IEnumerable<ApplicationUser> GetUsersForSharedProject(Project project)
        {
            if (project == null)
            {
                throw new ArgumentNullException(nameof(project));
            }

            using (var unitOfWork = _unitOfWorkFactory.GetUnitOfWork())
            {
                var projectUsers = GetProjectUsers(project).Select(p => p.Id).ToList();
                return unitOfWork.Users.GetMany(x => !projectUsers.Contains(x.Id));
            }
        }

        public void DeleteUserFromProjectsShare(Project project, ApplicationUser user)
        {
            if (project == null)
            {
                throw new ArgumentNullException(nameof(project));
            }

            if (user == null)
            {
                throw new ArgumentNullException(nameof(user));
            }

            using (var unitOfWork = _unitOfWorkFactory.GetUnitOfWork())
            {
                var projectsShare = unitOfWork.ProjectsShares.GetAll()
                        .FirstOrDefault(c => c.ProjectId.Equals(project.ProjectID) && c.UserId.Equals(user.Id));

                if (projectsShare != null)
                {
                    unitOfWork.ProjectsShares.Delete(projectsShare);

                    unitOfWork.Save();
                }

            }
        }
    }
}