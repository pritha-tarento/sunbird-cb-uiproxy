import axios from 'axios'
import { Router } from 'express'
import * as fs from 'fs'
import { axiosRequestConfig, axiosRequestConfigLong, axiosRequestConfigVeryLong } from '../../configs/request.config'
import { IPersonalDetails, ISBUser, ISunbirdbUserResponse } from '../../models/user.model'
import { CONSTANTS } from '../../utils/env'
import { logError, logInfo } from '../../utils/logger'
import { ERROR } from '../../utils/message'
import { extractUserIdFromRequest, extractUserToken } from '../../utils/requestExtract'

const API_END_POINTS = {
    createOSUserRegistry: (userId: string) => `${CONSTANTS.NETWORK_HUB_SERVICE_BACKEND}/v1/user/create/profile?userId=${userId}`,
    createSb: `${CONSTANTS.LEARNER_SERVICE_API_BASE}/v3/user/create`,
    createUserRegistry: `${CONSTANTS.USER_PROFILE_API_BASE}/public/v8/profileDetails/createUserRegistry`,
    getMasterLanguages: `${CONSTANTS.USER_PROFILE_API_BASE}/public/v8/profileDetails/getMasterLanguages`,
    getMasterNationalities: `${CONSTANTS.USER_PROFILE_API_BASE}/public/v8/profileDetails/getMasterNationalities`,
    getOSUserRegistryById: (userId: string) => `${CONSTANTS.NETWORK_HUB_SERVICE_BACKEND}/v1/user/search/profile?userId=${userId}`,
    getProfilePageMeta: `${CONSTANTS.USER_PROFILE_API_BASE}/public/v8/profileDetails/getProfilePageMeta`,
    getUserRegistry: `${CONSTANTS.USER_PROFILE_API_BASE}/public/v8/profileDetails/getUserRegistry`,
    getUserRegistryById: `${CONSTANTS.USER_PROFILE_API_BASE}/public/v8/profileDetails/getUserRegistryById`,
    // tslint:disable-next-line: object-literal-sort-keys
    migrateRegistry: `${CONSTANTS.USER_PROFILE_API_BASE}/public/v8/profileDetails/migrateRegistry`,
    resetPassword: `${CONSTANTS.LEARNER_SERVICE_API_BASE}/private/user/v1/password/reset`,
    searchSb: `${CONSTANTS.LEARNER_SERVICE_API_BASE}/private/user/v1/search`,
    sendWelcomeEmail: `${CONSTANTS.LEARNER_SERVICE_API_BASE}/private/user/v1/notification/email`,
    setUserProfileStatus: `${CONSTANTS.USER_PROFILE_API_BASE}/public/v8/profileDetails/setUserProfileStatus`,
    updateOSUserRegistry: (userId: string) => `${CONSTANTS.NETWORK_HUB_SERVICE_BACKEND}/v1/user/update/profile?userId=${userId}`,
    userProfileStatus: `${CONSTANTS.USER_PROFILE_API_BASE}/public/v8/profileDetails/userProfileStatus`,
    userRead: (userId: string) => `${CONSTANTS.LEARNER_SERVICE_API_BASE}/v1/user/read/${userId}`,
}

export async function getUserProfileStatus(wid: string) {
    try {
        const response = await axios.post(API_END_POINTS.userProfileStatus, { wid }, {
            ...axiosRequestConfig,
        })
        if (response.data.status) {
            return true
        } else {
            return false
        }
    } catch (err) {
        logError('ERROR GETTING USER PROFILE STATUS FROM  ${API_END_POINTS.userProfileStatus} >', err)
        return false
    }
}

export const profileDeatailsApi = Router()

profileDeatailsApi.post('/createUserRegistry', async (req, res) => {
    try {
        const userId = extractUserIdFromRequest(req)
        logInfo('Create user registry for', userId)
        const response = await axios.post(API_END_POINTS.createUserRegistry, { ...req.body, userId }, {
            ...axiosRequestConfigLong,
        })
        res.status(response.status).json(response.data)
    } catch (err) {
        logError('ERROR CREATING USER REGISTRY >', err)
        res.status((err && err.response && err.response.status) || 500).send(err)
    }
})

// tslint:disable-next-line: no-identical-functions
profileDeatailsApi.get('/getUserRegistry', async (req, res) => {
    try {
        const userId = extractUserIdFromRequest(req)
        logInfo('Get user registry for', userId)
        const response = await axios.post(API_END_POINTS.getUserRegistry, { userId }, {
            ...axiosRequestConfig,
        })
        res.status(response.status).send(response.data)
    } catch (err) {
        logError('ERROR FETCHING USER REGISTRY >', err)
        res.status((err && err.response && err.response.status) || 500).send(err)
    }
})

// tslint:disable-next-line: no-identical-functions
profileDeatailsApi.get('/getUserRegistryById/:id', async (req, res) => {
    try {
        let userId = req.params.id
        if (!userId) {
            userId = extractUserIdFromRequest(req)
        }
        logInfo('Get user registry for', userId)

        const response = await axios.post(API_END_POINTS.getUserRegistry, { userId }, {
            ...axiosRequestConfig,
        })
        res.status(response.status).send(response.data)
    } catch (err) {
        logError('ERROR FETCHING USER REGISTRY >', err)
        res.status((err && err.response && err.response.status) || 500).send(err)
    }
})

profileDeatailsApi.get('/userProfileStatus', async (req, res) => {
    try {
        const org = req.header('org')
        const rootOrg = req.header('rootOrg')
        if (!org || !rootOrg) {
            res.status(400).send(ERROR.ERROR_NO_ORG_DATA)
            return
        }
        req.body.wid = extractUserIdFromRequest(req)
        const response = await axios.post(API_END_POINTS.userProfileStatus, req, {
            ...axiosRequestConfig,
            headers: { rootOrg },
        })
        res.status(response.status).send(response.data)
    } catch (err) {
        logError('ERROR FETCHING USER PROFILE STATUS >', err)
        res.status((err && err.response && err.response.status) || 500).send(err)
    }
})

profileDeatailsApi.post('/setUserProfileStatus', async (req, res) => {
    try {
        req.body.wid = extractUserIdFromRequest(req)
        const response = await axios.post(API_END_POINTS.setUserProfileStatus, req, {
            ...axiosRequestConfig,
            headers: req.headers,
        })
        res.status(response.status).send(response.data)
    } catch (err) {
        logError('ERROR SETTING USER PROFILE STATUS >', err)
        res.status((err && err.response && err.response.status) || 500).send(err)
    }
})

profileDeatailsApi.get('/getMasterLanguages', async (_req, res) => {
    try {
        const response = await axios.get(API_END_POINTS.getMasterLanguages, {
            ...axiosRequestConfig,
        })
        res.status(response.status).send(response.data)
    } catch (err) {
        logError('ERROR FETCHING MASTER LANGUAGES >', err)
        res.status((err && err.response && err.response.status) || 500).send(err)
    }
})

// tslint:disable-next-line: no-identical-functions
profileDeatailsApi.get('/getMasterNationalities', async (_req, res) => {
    try {
        const response = await axios.get(API_END_POINTS.getMasterNationalities, {
            ...axiosRequestConfig,
        })
        res.status(response.status).send(response.data)
    } catch (err) {
        logError('ERROR FETCHING MASTER NATIONALITIES >', err)
        res.status((err && err.response && err.response.status) || 500).send(err)
    }
})

profileDeatailsApi.get('/getProfilePageMeta', async (_req, res) => {
    try {
        const response = await axios.get(API_END_POINTS.getProfilePageMeta, {
            ...axiosRequestConfig,
        })
        res.status(response.status).send(response.data)
    } catch (err) {
        logError('ERROR FETCHING MASTER NATIONALITIES >', err)
        res.status((err && err.response && err.response.status) || 500).send(err)
    }
})

// Api to migrate data from eagleUser opensaber  to new userProfile opensaber
profileDeatailsApi.get('/migrateRegistry', async (req, res) => {
    const filePath = CONSTANTS.USER_BULK_UPLOAD_DIR || process.cwd() + '/user_upload/'
    try {
        // tslint:disable-next-line: no-any
        fs.readFile(filePath + 'migrateRegistry.json', async (err: any, json: any) => {
            if (!err) {
                const obj = JSON.parse(json)
                const widList = obj.widList
                const userId = extractUserIdFromRequest(req)

                logInfo('migrating the registry')
                const response = await axios.post(
                    API_END_POINTS.migrateRegistry,
                    { ...req.body, userId, widList },
                    {
                        ...axiosRequestConfigVeryLong,
                    }
                )
                res.status(response.status).json(response.data)
            } else {
                res.status(500).send(err)
            }
        })
    } catch (err) {
        logError('ERROR CREATING USER REGISTRY >', err)
        res.status((err && err.response && err.response.status) || 500).send(err)
    }
})

profileDeatailsApi.post('/createUser', async (req, res) => {
    try {
        const sbChannel = req.body.personalDetails.channel
        if (!sbChannel) {
            res.status(400).send('Channel param is missing in personalDetails. Use DeptName as Channel value.')
            return
        }
        const sbemail_ = req.body.personalDetails.email
        const sbemailVerified_ = true
        const sbfirstName_ = req.body.personalDetails.firstName
        const sblastName_ = req.body.personalDetails.lastName

        const searchresponse = await axios({
            ...axiosRequestConfig,
            data: { request: { query: '', filters: { email: sbemail_.toLowerCase() } } },
            method: 'POST',
            url: API_END_POINTS.searchSb,
        })
        if (searchresponse.data.result.response.count > 0) {
            res.status(400).send('Email address already exist')
            return
        } else {
            const sbUserProfile: Partial<ISBUser> = {
                channel: sbChannel, email: sbemail_, emailVerified: sbemailVerified_, firstName: sbfirstName_,
                lastName: sblastName_,
            }
            const response = await axios({
                ...axiosRequestConfig,
                data: { request: sbUserProfile },
                method: 'POST',
                url: API_END_POINTS.createSb,
            })
            if (response.data.responseCode === 'CLIENT_ERROR') {
                res.status(400).send('Not able to create User in SunBird')
                return
            } else {
                const sbUserId = response.data.result.userId
                const sbUserReadResponse = await axios({
                    ...axiosRequestConfig,
                    headers: {
                        Authorization: CONSTANTS.SB_API_KEY,
                        'x-authenticated-user-token': extractUserToken(req),
                    },
                    method: 'GET',
                    url: API_END_POINTS.userRead(sbUserId),
                })
                if (sbUserReadResponse.data.params.status !== 'success') {
                    res.status(500).send('Failed to read newly created user details.')
                    return
                }

                const passwordResetRequest = {
                    key: 'email',
                    type: 'email',
                    userId: sbUserId,
                }

                logInfo('Sending Password reset request -> ' + passwordResetRequest)
                const passwordResetResponse = await axios({
                    ...axiosRequestConfig,
                    data: { request: passwordResetRequest },
                    method: 'POST',
                    url: API_END_POINTS.resetPassword,
                })
                logInfo('Received response from password reset -> ' + passwordResetResponse)

                if (passwordResetResponse.data.params.status === 'success') {
                    const welcomeMailRequest = {
                        allowedLoging: 'You can use your email to Login',
                        body: 'Hello',
                        emailTemplateType: 'welcome',
                        link: passwordResetResponse.data.result.link,
                        mode: 'email',
                        orgName: sbChannel,
                        recipientEmails: [ sbemail_ ],
                        setPasswordLink: true,
                        subject: 'Welcome Email',
                        welcomeMessage: 'Hello',
                    }

                    const welcomeMailResponse = await axios({
                        ...axiosRequestConfig,
                        data: { request: welcomeMailRequest },
                        method: 'POST',
                        url: API_END_POINTS.sendWelcomeEmail,
                    })

                    if (welcomeMailResponse.data.params.status !== 'success') {
                        res.status(500).send('Failed to send Welcome Email.')
                        return
                    }
                } else {
                    res.status(500).send('Failed to reset the password for user.')
                    return
                }

                const personalDetailsRegistry: IPersonalDetails = {
                    firstname: sbfirstName_,
                    primaryEmail: sbemail_,
                    surname: sblastName_,
                    userName: sbUserReadResponse.data.result.response.userName,
                }
                const userRegistry = getUserRegistry(personalDetailsRegistry, sbChannel)
                const userRegistryResponse = await axios({
                    ...axiosRequestConfig,
                    data: userRegistry,
                    headers: {
                        wid: sbUserId,
                    },
                    method: 'POST',
                    url: API_END_POINTS.createOSUserRegistry(sbUserId),
                })
                if (userRegistryResponse.data === null) {
                    res.status(500).send('Not able to create User Registry in Opensaber')
                } else {
                    const sbUserProfileResponse: Partial<ISunbirdbUserResponse> = {
                        email: sbemail_, firstName: sbfirstName_, lastName: sblastName_,
                        userId: sbUserId,
                    }
                    res.send(sbUserProfileResponse)
                }
            }
        }
    } catch (err) {
        logError('ERROR CREATING USER >', err)
        res.status((err && err.response && err.response.status) || 500).send(err)
    }
})

function getUserRegistry(personalDetailsRegistry: IPersonalDetails, deptName: string) {
    return {
        academics: [
            {
                nameOfInstitute: '',
                nameOfQualification: '',
                type: 'X_STANDARD',
                yearOfPassing: '',
            },
            {
                nameOfInstitute: '',
                nameOfQualification: '',
                type: 'XII_STANDARD',
                yearOfPassing: '',
            },
        ],
        employmentDetails: {
            allotmentYearOfService: '',
            cadre: '',
            civilListNo: '',
            departmentName: deptName,
            dojOfService: '',
            employeeCode: '',
            officialPostalAddress: '',
            payType: '',
            pinCode: '',
            service: '',
        },
        interests: {
            hobbies: [],
            professional: [],
        },
        personalDetails: personalDetailsRegistry,
        professionalDetails: [
            {
                name: '',
            },
        ],
        skills: {
            additionalSkills: '',
            certificateDetails: '',
        },
    }
}
