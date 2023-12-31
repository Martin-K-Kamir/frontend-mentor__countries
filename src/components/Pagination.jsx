import Button from "./Button.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { GoArrowLeft, GoArrowRight } from "react-icons/go";

const Pagination = ({ currentPage, itemsTotal, itemsPerPage }) => {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const isPrevDisabled = +currentPage === 1 || itemsTotal === 0;
    const isNextDisabled =
        +currentPage === Math.ceil(itemsTotal / itemsPerPage) ||
        itemsTotal === 0;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [currentPage]);

    const handlePrevClick = () => {
        navigate(pathname.replace(currentPage, +currentPage - 1));
    };

    const handleNextClick = () => {
        navigate(pathname.replace(currentPage, +currentPage + 1));
    };

    return (
        <div className="flex items-center lg:items-start justify-between gap-4 flex-col-reverse lg:flex-row">
            {itemsTotal > 0 && (
                <p className="text-sm">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, itemsTotal)} of{" "}
                    {itemsTotal} results
                </p>
            )}
            <div className="flex gap-3 lg:ml-auto">
                <Button
                    bold
                    size="sm"
                    onClick={handlePrevClick}
                    disabled={isPrevDisabled}
                    startIcon={<GoArrowLeft strokeWidth="1px" />}
                >
                    Previous
                </Button>
                <Button
                    bold
                    size="sm"
                    onClick={handleNextClick}
                    disabled={isNextDisabled}
                    endIcon={<GoArrowRight strokeWidth="1px" />}
                >
                    Next
                </Button>
            </div>
        </div>
    );
};

export default Pagination;
