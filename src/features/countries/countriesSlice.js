import { api } from "../api/api";
import { createEntityAdapter } from "@reduxjs/toolkit";
import { createSelector, weakMapMemoize } from "reselect";
import { apiLongRunningRequest } from "../api/apiHelpers.js";

export const countriesAdapter = createEntityAdapter({
    selectId: country => country.name.common,
    sortComparer: (a, b) => a.name.common.localeCompare(b.name.common),
});

const initialState = countriesAdapter.getInitialState();

const extendedApi = api.injectEndpoints({
    endpoints: builder => ({
        getCountries: builder.query({
            query: () => "/all?fields=name,flags,population,capital,region",
            transformResponse: response => {
                const data = response.map(country => ({
                    name: country.name,
                    flags: country.flags,
                    region: country.region.toLowerCase(),
                    info: [
                        {
                            label: "Population",
                            value: country.population
                                ? new Intl.NumberFormat().format(
                                      country.population
                                  )
                                : "N/A",
                        },
                        {
                            label: "Region",
                            value: country.region || "N/A",
                        },
                        {
                            label: "Capital",
                            value: country.capital?.join(", ") || "N/A",
                        },
                    ],
                }));

                return countriesAdapter.setAll(initialState, data);
            },
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                await apiLongRunningRequest(queryFulfilled, dispatch);
            },
        }),
        getCountry: builder.query({
            query: id =>
                `/name/${id}?fields=name,flags,population,capital,region,subregion,tld,currencies,languages,borders&fullText=true`,
            transformResponse: response => {
                const [data] = response;

                return {
                    name: data.name.official,
                    flags: data.flags,
                    borders: data.borders,
                    info: [
                        {
                            label: "Native Name",
                            value:
                                Object.values(data.name.nativeName)[0]
                                    ?.official ?? "N/A",
                        },
                        {
                            label: "Population",
                            value: data.population
                                ? new Intl.NumberFormat().format(
                                      data.population
                                  )
                                : "N/A",
                        },
                        {
                            label: "Region",
                            value: data.region || "N/A",
                        },
                        {
                            label: "Sub Region",
                            value: data.subregion || "N/A",
                        },
                        {
                            label: "Capital",
                            value: data.capital.join(", ") || "N/A",
                        },
                        {
                            label: "Top Level Domain",
                            value: data.tld.join(", ") || "N/A",
                        },
                        {
                            label: "Currencies",
                            value:
                                Object.values(data.currencies)
                                    .map(({ name }) => name)
                                    .join(", ") || "N/A",
                        },
                        {
                            label: "Languages",
                            value:
                                Object.values(data.languages).join(", ") ||
                                "N/A",
                        },
                    ],
                };
            },
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                await apiLongRunningRequest(queryFulfilled, dispatch);
            },
        }),
        getBorderCountries: builder.query({
            query: borders => `/alpha?codes=${borders}&fields=name`,
            transformResponse: response => {
                return response.map(({ name }) => name.common);
            },
        }),
        searchCountry: builder.query({
            query: name => `/name/${name}?fields=name`,
            transformResponse: response => {
                return response.map(({ name }) => name.common);
            },
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                await apiLongRunningRequest(queryFulfilled, dispatch);
            },
        }),
    }),
});

export const {
    useGetCountriesQuery,
    useGetCountryQuery,
    useGetBorderCountriesQuery,
    useSearchCountryQuery,
    useLazySearchCountryQuery,
} = extendedApi;

export const selectCountriesResult =
    extendedApi.endpoints.getCountries.select();

const selectCountriesData = createSelector(
    selectCountriesResult,
    countriesResult => countriesResult.data
);

export const selectCountryIdsByRegion = createSelector(
    state => selectCountriesData(state)?.entities ?? initialState.entities,
    (_, searchResults) => searchResults,
    (_, __, region) => region,
    (countries, searchResults, region) => {
        const data = searchResults
            ? searchResults.map(nameId => countries[nameId])
            : Object.values(countries);

        const filteredData = data
            .filter(country => country.region === region)
            .map(country => country.name.common);

        return searchResults
            ? filteredData
            : filteredData.sort((a, b) => a.localeCompare(b));
    },
    {
        memoize: weakMapMemoize,
        argsMemoize: weakMapMemoize,
    }
);

export const {
    selectAll: selectAllCountries,
    selectById: selectCountryById,
    selectIds: selectCountryIds,
    selectTotal: selectCountriesTotal,
} = countriesAdapter.getSelectors(
    state => selectCountriesData(state) ?? initialState
);
