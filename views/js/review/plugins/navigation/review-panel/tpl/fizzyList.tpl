<ol class="review-panel-sections">
    {{#each sections}}
    <li class="review-panel-section">
        {{#if ../displaySectionTitles}}
            <span class="review-panel-label" title="{{title}}">
                <span class="review-panel-text">{{title}}</span>
            </span>
        {{/if}}
        <div class="review-panel-items"></div>
    </li>
    {{/each}}
</ol>