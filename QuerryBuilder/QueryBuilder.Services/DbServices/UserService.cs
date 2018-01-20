using System;
using System.Collections.Generic;
using System.Linq;
using QueryBuilder.Constants;
using QueryBuilder.DAL.Contracts;
using QueryBuilder.DAL.Models;
using QueryBuilder.Services.Contracts;

namespace QueryBuilder.Services.DbServices
{
    public class UserService: IUserService
    {
        private readonly IUnitOfWorkFactory _unitOfWorkFactory;

        public UserService(IUnitOfWorkFactory unitOfWorkFactory)
        {
            _unitOfWorkFactory = unitOfWorkFactory;
        }

        public User GetUserByEmail(string email)
        {
            using (var unitOfWork = _unitOfWorkFactory.GetUnitOfWork())
            {
                return unitOfWork.Users.GetAll().FirstOrDefault(e => e.Email.Equals(email) && e.Delflag == DelflagConstants.ActiveSet);
            }
        }

        public IEnumerable<User> GetUsers()
        {
            using (var unitOfWork = _unitOfWorkFactory.GetUnitOfWork())
            {
                return unitOfWork.Users.GetMany(p => p.Delflag == DelflagConstants.ActiveSet);
            }
        }

        public void CreateUser(User user)
        {
            if (user == null)
            {
                throw new ArgumentNullException(nameof(user));
            }

            using (var unitOfWork = _unitOfWorkFactory.GetUnitOfWork())
            {
                unitOfWork.Users.Create(user);
                unitOfWork.Save();
            }            
        }
    }
}