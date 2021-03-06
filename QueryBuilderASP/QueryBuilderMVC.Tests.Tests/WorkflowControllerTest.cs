// <copyright file="WorkflowControllerTest.cs">Copyright ©  2016</copyright>
using System;
using Microsoft.Pex.Framework;
using Microsoft.Pex.Framework.Validation;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using QueryBuilderMVC.Tests.Controllers;

namespace QueryBuilderMVC.Tests.Controllers.Tests
{
    /// <summary>This class contains parameterized unit tests for WorkflowController</summary>
    [PexClass(typeof(WorkflowController))]
    [PexAllowedExceptionFromTypeUnderTest(typeof(InvalidOperationException))]
    [PexAllowedExceptionFromTypeUnderTest(typeof(ArgumentException), AcceptExceptionSubtypes = true)]
    [TestClass]
    public partial class WorkflowControllerTest
    {
        /// <summary>Test stub for TestMethod1()</summary>
        [PexMethod]
        public void TestMethod1Test([PexAssumeUnderTest]WorkflowController target)
        {
            target.TestMethod1();
            // TODO: add assertions to method WorkflowControllerTest.TestMethod1Test(WorkflowController)
        }
    }
}
