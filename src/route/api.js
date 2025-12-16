import { Router } from 'express';
import {registration,login,profileUpdate,profileDelete,profileDetails,viewUserList,getUserByEmail} from '../controller/userController.js';
import {addProject,viewProjectList,updateProject,deleteProject} from '../controller/projectController.js';
import {addBacklink,viewBacklinkList,updateBacklink,deleteBacklink,viewBacklinksByProject} from '../controller/backlinkController.js';
import {fetchAndSaveBlogs,viewBlogListByProject , viewBlogList} from '../controller/blogController.js';
import {addOnPageReport,updateOnPageReport,viewOnPageReports,deleteOnPageReport,viewReportsByProject} from '../controller/onPageController.js';
import {addSmmLinks,viewSmmList,updateSmmLink,deleteSmmLink,viewSmmByProject,} from '../controller/smmController.js';
import {addGbpReport,viewAllGbpReports,viewGbpReportsByProject,updateGbpReport,deleteGbpReport} from '../controller/gbpController.js';
import {fetchAndSaveGA4, viewGA4ByProject} from '../controller/ga4Controller.js';
import { fetchAndSaveKeywordReports, viewKeywordReportsByProject} from "../controller/KeywordReportController.js";
import { addKeyword,getKeywords,getKeywordsByProject,updateKeyword,deleteKeyword} from '../controller/keywordController.js';
import { addHealthReport,viewAllHealthReports,viewHealthReportsByProject,updateHealthReport,deleteHealthReport} from '../controller/healthController.js';
import { addWebVitalReport,viewAllWebVitalReports,viewWebVitalReportsByProject,updateWebVitalReport,deleteWebVitalReport} from '../controller/webVitalController.js';
import { fetchMonthlyPerformance,viewPerformanceReports,viewPerformanceByProject} from '../controller/performanceController.js';
import { viewAllSocialOptimizations,addSocialOptimization,viewSocialOptimizationsByProject,updateSocialOptimization,deleteSocialOptimization} from '../controller/socialOptimizeController.js';
import { addReputationReport,viewAllReputationReports,viewReputationReportsByProject,updateReputationReport, deleteReputationReport} from '../controller/reputationController.js';
import { addOrganicReport,viewAllOrganicReports,viewOrganicReportsByProject,updateOrganicReport,deleteOrganicReport} from '../controller/organicController.js';
import { viewCurrentMonthProjectSummary } from '../controller/reportSummaryController.js';


import Authentication from '../middleware/auth.js';
import checkRole from '../middleware/checkRole.js';

const router = Router();

// 🔐 Auth & User Routes

router.post('/registration', registration);
router.post('/login', login);

router.put('/profileUpdate/:id', Authentication, profileUpdate);
router.delete('/profileDelete/:id', Authentication, checkRole('admin'), profileDelete);
router.get('/profileDetails', Authentication, profileDetails);

// ✅ Allow admin to view users
router.get('/viewUserList', Authentication, checkRole('admin'), viewUserList);
router.get('/getUserByEmail/:email', Authentication, checkRole('admin'), getUserByEmail);

// 📁 Project Routes

router.post('/addProject', Authentication, checkRole('admin'), addProject);
router.get('/viewProjectList', Authentication, checkRole('admin'), viewProjectList);
router.put('/updateProject/:id', Authentication, checkRole('admin'), updateProject);
router.delete('/deleteProject/:id', Authentication, checkRole('admin'), deleteProject);

// Report Summary Routes

router.get('/viewCurrentMonthProjectSummary/:id', viewCurrentMonthProjectSummary );


// 📝 Organic Report Routes

router.post('/addOrganicReport', Authentication, checkRole('admin', 'project manager'), addOrganicReport);
router.get('/viewAllOrganicReports', Authentication, checkRole('admin', 'project manager'), viewAllOrganicReports);
router.get('/viewOrganicReportsByProject/:id', viewOrganicReportsByProject);
router.put('/updateOrganicReport/:id', Authentication, checkRole('admin', 'project manager'), updateOrganicReport);
router.delete('/deleteOrganicReport/:id', Authentication, checkRole('admin', 'project manager'), deleteOrganicReport);

// 📝 Backlink Routes

router.post('/addBacklink', Authentication, checkRole('admin', 'backlink expert'), addBacklink);
router.get('/viewBacklinkList', Authentication, checkRole('admin', 'backlink expert'), viewBacklinkList);
router.get('/viewBacklinksByProject/:id', viewBacklinksByProject);
router.put('/updateBacklink/:id', Authentication, checkRole('admin', 'backlink expert'), updateBacklink);
router.delete('/deleteBacklink/:id', Authentication, checkRole('admin', 'backlink expert'), deleteBacklink);

// 📝 Blog Routes

router.get('/fetchAndSaveBlogs', fetchAndSaveBlogs);
router.get('/viewBlogList', Authentication, checkRole('admin'), viewBlogList);
router.get('/viewBlogListByProject/:name', viewBlogListByProject);

// 📝 Health Report Routes

router.post('/addHealthReport', Authentication, checkRole('admin', 'project manager'), addHealthReport);
router.get('/viewAllHealthReports', Authentication, checkRole('admin', 'project manager'), viewAllHealthReports);
router.get('/viewHealthReportsByProject/:id', viewHealthReportsByProject);
router.put('/updateHealthReport/:id', Authentication, checkRole('admin', 'project manager'), updateHealthReport);
router.delete('/deleteHealthReport/:id', Authentication, checkRole('admin', 'project manager'), deleteHealthReport);

// 📝 Web Vitals Report Routes

router.post('/addWebVitalReport', Authentication, checkRole('admin', 'project manager'), addWebVitalReport);
router.get('/viewAllWebVitalReports', Authentication, checkRole('admin', 'project manager'), viewAllWebVitalReports);
router.get('/viewWebVitalReportsByProject/:id', viewWebVitalReportsByProject);
router.put('/updateWebVitalReport/:id', Authentication, checkRole('admin', 'project manager'), updateWebVitalReport);
router.delete('/deleteWebVitalReport/:id', Authentication, checkRole('admin', 'project manager'), deleteWebVitalReport);

// 📝 Performance Report Routes

router.get('/fetchMonthlyPerformance', fetchMonthlyPerformance);
router.get('/viewPerformanceReports', Authentication, checkRole('admin'), viewPerformanceReports);
router.get('/viewPerformanceByProject/:projectId', viewPerformanceByProject);


// 📝 On Page Report Routes

router.post('/addOnPageReport', Authentication, checkRole('admin', 'project manager'), addOnPageReport);
router.get('/viewOnPageReports', Authentication, checkRole('admin', 'project manager'), viewOnPageReports);
router.get('/viewReportsByProject/:id', viewReportsByProject);
router.put('/updateOnPageReport/:id', Authentication, checkRole('admin', 'project manager'), updateOnPageReport);
router.delete('/deleteOnPageReport/:id', Authentication, checkRole('admin', 'project manager'), deleteOnPageReport);

// 📝 SMM Report Routes

router.post('/addSmmLinks', Authentication, checkRole('admin', 'social media expert'), addSmmLinks);
router.get('/viewSmmList', Authentication, checkRole('admin', 'social media expert'), viewSmmList);
router.get('/viewSmmByProject/:id', viewSmmByProject);
router.put('/updateSmmLink/:id', Authentication, checkRole('admin', 'social media expert'), updateSmmLink);
router.delete('/deleteSmmLink/:id', Authentication, checkRole('admin', 'social media expert'), deleteSmmLink);

// 📝 GBP Report Routes

router.post('/addGbpReport', Authentication, checkRole('admin', 'project manager'), addGbpReport);
router.get('/viewAllGbpReports', Authentication, checkRole('admin', 'project manager'), viewAllGbpReports);
router.get('/viewGbpReportsByProject/:id', viewGbpReportsByProject);
router.put('/updateGbpReport/:id', Authentication, checkRole('admin', 'project manager'), updateGbpReport);
router.delete('/deleteGbpReport/:id', Authentication, checkRole('admin', 'project manager'), deleteGbpReport);

// 📝 Social Optimized Routes

router.post('/addSocialOptimization', Authentication, checkRole('admin', 'project manager', 'social media expert'), addSocialOptimization);
router.get('/viewAllSocialOptimizations', Authentication, checkRole('admin', 'project manager', 'social media expert'), viewAllSocialOptimizations);
router.get('/viewSocialOptimizationsByProject/:id', viewSocialOptimizationsByProject);
router.put('/updateSocialOptimization/:id', Authentication, checkRole('admin', 'project manager', 'social media expert'), updateSocialOptimization);
router.delete('/deleteSocialOptimization/:id', Authentication, checkRole('admin', 'project manager', 'social media expert'), deleteSocialOptimization);

// 📝 Reputation Report Routes

router.post('/addReputationReport', Authentication, checkRole('admin', 'project manager', 'social media expert'), addReputationReport);
router.get('/viewAllReputationReports', Authentication, checkRole('admin', 'project manager', 'social media expert'), viewAllReputationReports);
router.get('/viewReputationReportsByProject/:id', viewReputationReportsByProject);
router.put('/updateReputationReport/:id', Authentication, checkRole('admin', 'project manager', 'social media expert'), updateReputationReport);
router.delete('/deleteReputationReport/:id', Authentication, checkRole('admin', 'project manager', 'social media expert'), deleteReputationReport);

// 📝 GA4 Routes

router.get('/fetchAndSaveGA4', fetchAndSaveGA4);
router.get('/viewGA4ByProject/:id', viewGA4ByProject );

// 📝 Keyword Routes

router.post('/addKeyword', Authentication, checkRole('admin', 'project manager'), addKeyword);
router.get('/getKeywords', Authentication, checkRole('admin', 'project manager'), getKeywords);
router.get('/getKeywordsByProject/:id', getKeywordsByProject);
router.put('/updateKeyword/:id', Authentication, checkRole('admin', 'project manager'), updateKeyword);
router.delete('/deleteKeyword/:id', Authentication, checkRole('admin', 'project manager'), deleteKeyword);

// 📝 Keyword Report Routes

router.get('/fetchAndSaveKeywordReports', fetchAndSaveKeywordReports);
router.get('/viewKeywordReportsByProject/:id', viewKeywordReportsByProject);

export default router;