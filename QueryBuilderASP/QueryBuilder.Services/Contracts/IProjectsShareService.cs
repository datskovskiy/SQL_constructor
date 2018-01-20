using System.Collections.Generic;
using QueryBuilder.DAL.Models;

namespace QueryBuilder.Services.Contracts
{
    public interface IProjectsShareService
    {
        void AddUserToProjectsShare(Project project, ApplicationUser user, int userRole, ApplicationUser fromUser = null);

        IEnumerable<Project> GetUserProjects(ApplicationUser user);

        IEnumerable<ApplicationUser> GetProjectUsers(Project project);

        IEnumerable<ApplicationUser> GetUsersForSharedProject(Project project);

        int GetUserRole(ApplicationUser user, int projectId);

        void DeleteUserFromProjectsShare(Project project, ApplicationUser user);
    }
}