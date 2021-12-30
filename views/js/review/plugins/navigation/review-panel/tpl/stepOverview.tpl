<ul class="step-overview-sections">
    {{#each sections}}
    <li class="step-overview-section">
        {{#if ../displaySectionTitles}}
            <span class="step-overview-section-label">
                {{label}}
            </span>
        {{/if}}
        <ul class="step-overview-items">
            {{#each items}}
            <li class="step-overview-item {{type}} {{#if scoreType}}{{scoreType}}{{/if}} {{#if disabled}}disabled{{/if}}" data-id="{{id}}">
                <button class="step-overview-btn"
                        role="link"
                        aria-label="{{ariaLabel}}"
                        {{#if disabled}}aria-disabled="{{disabled}}"{{/if}}
                        data-id="{{id}}">
                    <span class="icon-indicator indicator" aria-hidden="true"></span>
                    {{#if scoreType}}
                        <span class="step-overview-score">
                            <span class="step-overview-score-icon icon-{{scoreType}}" aria-hidden="true"></span>
                        </span>
                    {{/if}}
                    {{#if icon}}
                        <span class="step-overview-icon icon-{{icon}}" aria-hidden="true"></span>
                    {{/if}}
                    {{#unless icon}}
                        <span class="step-overview-label" aria-hidden="true">{{label}}</span>
                    {{/unless}}
                </button>
            </li>
            {{/each}}
        </ul>
    </li>
    {{/each}}
</ul>