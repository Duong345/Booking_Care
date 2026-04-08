import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FormattedMessage } from 'react-intl';

// @ts-ignore - SVG module declaration
import logo from '../../assets/images/logo.svg';
import { LANGUAGES } from '../../utils';
import { changeLanguageApp, processLogout } from '../../store/actions';
import {
  getAllSpecialty,
  getAllClinic,
  getAllDoctors,
} from '../../services/userService';
import './HomeHeader.scss';

interface SearchResult {
  id: string | number;
  name: string;
  type: 'specialty' | 'clinic' | 'doctor';
  image?: string;
}

interface Specialty {
  id: string | number;
  name: string;
  image?: string;
}

interface Clinic {
  id: string | number;
  name: string;
  image?: string;
}

interface Doctor {
  id: string | number;
  firstName: string;
  lastName: string;
  image?: string;
}

interface ApiResponse<T> {
  errCode: number;
  data?: T;
}

interface RootState {
  user: {
    isLoggedIn: boolean;
    userInfo?: any;
  };
  app: {
    language: string;
  };
}

interface Props {
  isShowBanner?: boolean;
}

const HomeHeader = ({ isShowBanner = true }: Props) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);
  const language = useSelector((state: RootState) => state.app.language);

  // Local state
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Handle language change
  const changeLanguage = useCallback(
    (lang: 'vi' | 'en') => {
      dispatch(changeLanguageApp(lang));
    },
    [dispatch]
  );

  // Handle return to home
  const returnToHome = useCallback(() => {
    navigate('/home');
  }, [navigate]);

  // Handle logout
  const handleLogout = useCallback(() => {
    dispatch(processLogout() as any);
    navigate('/login');
  }, [dispatch, navigate]);

  // Handle search change
  const handleSearchChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const newSearchValue = event.target.value;
      setSearchValue(newSearchValue);

      if (!newSearchValue.trim()) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }

      try {
        const [specialtiesRes, clinicsRes, doctorsRes] = await Promise.all([
          getAllSpecialty() as unknown as Promise<ApiResponse<Specialty[]>>,
          getAllClinic() as unknown as Promise<ApiResponse<Clinic[]>>,
          getAllDoctors() as unknown as Promise<ApiResponse<Doctor[]>>,
        ]);

        let results: SearchResult[] = [];

        // Filter specialties
        if (specialtiesRes?.data) {
          const filteredSpecialties = specialtiesRes.data.filter(
            (item) =>
              item.name &&
              item.name.toLowerCase().includes(newSearchValue.toLowerCase())
          );
          results = results.concat(
            filteredSpecialties.map((item) => ({
              id: item.id,
              name: item.name,
              type: 'specialty' as const,
              image: item.image,
            }))
          );
        }

        // Filter clinics
        if (clinicsRes?.data) {
          const filteredClinics = clinicsRes.data.filter(
            (item) =>
              item.name &&
              item.name.toLowerCase().includes(newSearchValue.toLowerCase())
          );
          results = results.concat(
            filteredClinics.map((item) => ({
              id: item.id,
              name: item.name,
              type: 'clinic' as const,
              image: item.image,
            }))
          );
        }

        // Filter doctors
        if (doctorsRes?.data) {
          const filteredDoctors = doctorsRes.data.filter((item) => {
            const fullName =
              `${item.firstName || ''} ${item.lastName || ''}`.trim();
            const searchLower = newSearchValue.toLowerCase();
            return (
              (item.firstName &&
                item.firstName.toLowerCase().includes(searchLower)) ||
              (item.lastName &&
                item.lastName.toLowerCase().includes(searchLower)) ||
              fullName.toLowerCase().includes(searchLower)
            );
          });
          results = results.concat(
            filteredDoctors.map((item) => ({
              id: item.id,
              name: `${item.firstName} ${item.lastName}`,
              type: 'doctor' as const,
              image: item.image,
            }))
          );
        }

        setSearchResults(results.slice(0, 10));
        setShowSearchResults(results.length > 0);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
        setShowSearchResults(false);
      }
    },
    []
  );

  // Handle result selection
  const handleSelectResult = useCallback(
    (result: SearchResult) => {
      if (result.type === 'specialty') {
        navigate(`/detail-specialty/${result.id}`);
      } else if (result.type === 'clinic') {
        navigate(`/detail-clinic/${result.id}`);
      } else if (result.type === 'doctor') {
        navigate(`/detail-doctor/${result.id}`);
      }
      setSearchValue('');
      setSearchResults([]);
      setShowSearchResults(false);
    },
    [navigate]
  );

  // Handle blur with timeout
  const handleBlur = useCallback(() => {
    setTimeout(() => {
      setShowSearchResults(false);
    }, 200);
  }, []);

  return (
    <>
      <div className="home-header-container">
        <div className="home-header-content">
          {/* Left Content */}
          <div className="left-content">
            <i className="fas fa-bars"></i>
            <img
              className="header-logo"
              src={logo}
              alt="Logo"
              onClick={returnToHome}
            />
          </div>

          {/* Center Content */}
          <div className="center-content">
            <div className="child-content">
              <div>
                <b>
                  <FormattedMessage id="homeheader.speciality" />
                </b>
              </div>
              <div className="subs-title">
                <FormattedMessage id="homeheader.searchdoctor" />
              </div>
            </div>
            <div className="child-content">
              <div>
                <b>
                  <FormattedMessage id="homeheader.health-facility" />
                </b>
              </div>
              <div className="subs-title">
                <FormattedMessage id="homeheader.select-room" />
              </div>
            </div>
            <div className="child-content">
              <div>
                <b>
                  <FormattedMessage id="homeheader.doctor" />
                </b>
              </div>
              <div className="subs-title">
                <FormattedMessage id="homeheader.select-doctor" />
              </div>
            </div>
            <div className="child-content">
              <div>
                <b>
                  <FormattedMessage id="homeheader.fee" />
                </b>
              </div>
              <div className="subs-title">
                <FormattedMessage id="homeheader.check-health" />
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="right-content">
            {/* Auth Buttons */}
            {!isLoggedIn ? (
              <>
                <div
                  className="btn btn-login"
                  onClick={() => navigate('/login')}
                >
                  <FormattedMessage id="homeheader.login" />
                </div>
                <div
                  className="btn btn-signup"
                  onClick={() => navigate('/signup')}
                >
                  <FormattedMessage id="homeheader.signup" />
                </div>
              </>
            ) : (
              <>
                <div
                  className="btn btn-profile"
                  onClick={() => navigate('/patient-profile')}
                >
                  <i className="fas fa-user-circle"></i>
                  <FormattedMessage id="homeheader.profile" />
                </div>
                <div className="btn btn-logout" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i>
                </div>
              </>
            )}

            {/* Language Switcher - Keep exact original structure */}
            <div
              className={
                language === LANGUAGES.VI ? 'language-vi active' : 'language-vi'
              }
            >
              <span onClick={() => changeLanguage(LANGUAGES.VI)}>VN</span>
            </div>
            <div
              className={
                language === LANGUAGES.EN ? 'language-en active' : 'language-en'
              }
            >
              <span onClick={() => changeLanguage(LANGUAGES.EN)}>EN</span>
            </div>
          </div>
        </div>
      </div>

      {/* Banner Section */}
      {isShowBanner === true && (
        <div className="home-header-banner">
          {/* Banner Top */}
          <div className="content-up">
            <div className="title1">
              <FormattedMessage id="banner.title1" />
            </div>
            <div className="title2">
              <FormattedMessage id="banner.title2" />
            </div>

            {/* Search Box */}
            <div className="search-container">
              <div className="search">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Tìm kiếm chuyên khoa, cơ sở y tế, bác sĩ"
                  value={searchValue}
                  onChange={handleSearchChange}
                  onBlur={handleBlur}
                />
              </div>

              {/* Search Results */}
              {showSearchResults && (
                <div className="search-results">
                  {searchResults.length > 0 ? (
                    searchResults.map((result) => (
                      <div
                        key={`${result.type}-${result.id}`}
                        className="result-item"
                        onClick={() => handleSelectResult(result)}
                      >
                        {result.image && (
                          <img src={result.image} alt={result.name} />
                        )}
                        <div className="result-info">
                          <div className="result-name">{result.name}</div>
                          <div className="result-type">
                            {result.type === 'specialty'
                              ? 'Chuyên khoa'
                              : result.type === 'clinic'
                                ? 'Cơ sở y tế'
                                : 'Bác sĩ'}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="result-item no-results">
                      Không tìm thấy kết quả
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Banner Bottom - Features */}
          <div className="content-down">
            <div className="options">
              <div className="option-child">
                <div className="icon-child">
                  <i className="far fa-hospital"></i>
                </div>
                <div className="text-child">
                  <FormattedMessage id="banner.child1" />
                </div>
              </div>
              <div className="option-child">
                <div className="icon-child">
                  <i className="fas fa-mobile-alt"></i>
                </div>
                <div className="text-child">
                  <FormattedMessage id="banner.child2" />
                </div>
              </div>
              <div className="option-child">
                <div className="icon-child">
                  <i className="fas fa-procedures"></i>
                </div>
                <div className="text-child">
                  <FormattedMessage id="banner.child3" />
                </div>
              </div>
              <div className="option-child">
                <div className="icon-child">
                  <i className="fas fa-flask"></i>
                </div>
                <div className="text-child">
                  <FormattedMessage id="banner.child4" />
                </div>
              </div>
              <div className="option-child">
                <div className="icon-child">
                  <i className="fas fa-user-md"></i>
                </div>
                <div className="text-child">
                  <FormattedMessage id="banner.child5" />
                </div>
              </div>
              <div className="option-child">
                <div className="icon-child">
                  <i className="fas fa-briefcase-medical"></i>
                </div>
                <div className="text-child">
                  <FormattedMessage id="banner.child6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HomeHeader;
